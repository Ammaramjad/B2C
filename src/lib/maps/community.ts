import { haversine } from "../live/geo.ts";
import type { GeoPoint } from "../live/types.ts";
import type { GeoProvider, RouteResult } from "./types.ts";

/** Community OSM/OSRM adapters. Labeled — not a production vendor contract. */
export const communityProvider: GeoProvider = {
  id: "community",
  tiles: {
    day: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    night: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  async geocode(query) {
    const q = query.trim();
    if (!q) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tw&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    const hit = rows[0];
    if (!hit) return null;
    return { point: { lat: Number(hit.lat), lng: Number(hit.lon) }, label: hit.display_name, source: "community" };
  },
  async route(from, to) {
    return communityRoute(from, to);
  },
  async eta(from, to) {
    const r = await communityRoute(from, to);
    return { km: r.km, etaMin: r.etaMin, source: r.source };
  },
  async traffic() {
    return { level: "clear", note: "Community map · no live traffic vendor", source: "community" };
  },
  async roadIncidents() {
    return [];
  },
};

export async function communityRoute(from: GeoPoint, to: GeoPoint): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("osrm");
    const data = (await res.json()) as {
      routes?: { distance: number; duration: number; geometry?: { coordinates: [number, number][] } }[];
    };
    const route = data.routes?.[0];
    if (!route?.geometry?.coordinates?.length) throw new Error("empty");
    return {
      path: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      km: Number((route.distance / 1000).toFixed(1)),
      etaMin: Math.max(1, Math.round(route.duration / 60)),
      source: "community",
    };
  } catch {
    const km = Number(haversine(from, to).toFixed(1));
    return { path: [from, to], km, etaMin: Math.max(3, Math.round(km * 2.4)), source: "simulation" };
  }
}
