import { listVehicles } from "../catalog-runtime.ts";

const klassToId: Record<string, string> = {
  Sedan: "sedan",
  Premium: "premium",
  SUV: "suv",
  MPV: "mpv",
  Van: "van",
  Shuttle: "shuttle",
};

function classes() {
  const map: Record<string, { seats: number; bags: number; id: string; name: string }> = {};
  for (const v of listVehicles()) {
    map[v.id] = { seats: v.seats, bags: v.luggage, id: v.id, name: v.name };
  }
  return map;
}

export function capacityFor(klass: string) {
  const id = klassToId[klass] ?? klass.toLowerCase();
  const all = classes();
  return all[id] ?? Object.values(all)[0] ?? { seats: 3, bags: 3, id: "sedan", name: "Sedan" };
}

export function vehicleFits(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  return pax <= cap.seats && bags <= cap.bags;
}

export function recommendFor(pax: number, bags: number) {
  return Object.values(classes())
    .filter((v) => v.seats >= pax && v.bags >= bags && v.id !== "shuttle")
    .sort((a, b) => a.seats - b.seats)
    .map((v) => v.name);
}

export function mismatchCopy(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  if (vehicleFits(klass, pax, bags)) return null;
  const rec = recommendFor(pax, bags);
  return `${cap.name} supports up to ${cap.seats} passengers and ${cap.bags} standard bags. For ${pax} passengers and ${bags} bags, Zoufeng recommends ${rec.slice(0, 2).join(" or ") || "a larger vehicle"}.`;
}
