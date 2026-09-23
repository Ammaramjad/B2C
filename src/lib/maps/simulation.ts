import { TPE_T1, haversine } from "../live/geo.ts";
import type { GeoPoint } from "../live/types.ts";
import type { GeoProvider } from "./types.ts";

const PLACES: Record<string, GeoPoint> = {
  tpe: TPE_T1,
  "tpe t1": TPE_T1,
  "tpe t2": { lat: 25.0765, lng: 121.232 },
  "taipei 101": { lat: 25.03396, lng: 121.56447 },
  xinyi: { lat: 25.0368, lng: 121.567 },
};

export const simulationProvider: GeoProvider = {
  id: "simulation",
  tiles: {
    day: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    night: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  },
  async geocode(query) {
    const key = query.trim().toLowerCase();
    const hit = Object.entries(PLACES).find(([k]) => key.includes(k));
    if (!hit) return null;
    return { point: hit[1], label: query, source: "simulation" };
  },
  async route(from, to) {
    const km = Number(haversine(from, to).toFixed(1));
    return { path: [from, to], km, etaMin: Math.max(3, Math.round(km * 2.4)), source: "simulation" };
  },
  async eta(from, to) {
    const km = Number(haversine(from, to).toFixed(1));
    return { km, etaMin: Math.max(3, Math.round(km * 2.4)), source: "simulation" };
  },
  async traffic() {
    return { level: "clear", note: "SIMULATED REALTIME · not a production GPS feed", source: "simulation" };
  },
};
