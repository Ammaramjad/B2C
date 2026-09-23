import { TPE_T1, haversine } from "./geo";
import { vehicleFits } from "./capacity";
import type { Candidate, LiveDriver } from "./types";

export type RankNeed = {
  pax: number;
  bags: number;
  excludeIds?: string[];
  pickup?: { lat: number; lng: number };
};

export function rankReplacements(drivers: LiveDriver[], need: RankNeed): Candidate[] {
  const dest = need.pickup ?? TPE_T1;
  return drivers
    .filter((d) => {
      if (need.excludeIds?.includes(d.id)) return false;
      if (d.state !== "available") return false;
      return vehicleFits(d.klass, need.pax, need.bags);
    })
    .map((d) => {
      const km = Number(haversine(d.loc, dest).toFixed(1));
      const etaMin = Math.max(3, Math.round(km * 2.6));
      const fleetBoost = d.fleet === "A" ? 0 : d.fleet === "B" ? 0.4 : 0.8;
      const score = km + fleetBoost + (1 - d.accept) + (5 - d.rating) * 0.2;
      const row: Candidate & { score: number } = {
        ...d,
        km,
        etaMin,
        why: [
          `${km} km to pickup`,
          `${d.klass} fits ${need.pax} pax / ${need.bags} bags`,
          `Fleet ${d.fleet} priority`,
          `${Math.round(d.accept * 100)}% accept · ${d.rating} rating`,
        ],
        score,
      };
      return row;
    })
    .sort((a, b) => a.score - b.score)
    .map(({ score: _score, ...row }) => row)
    .slice(0, 3);
}
