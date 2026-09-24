import type { GeoPoint } from "./types";

export const TPE: GeoPoint = { lat: 25.0797, lng: 121.2342 };
export const TPE_T1: GeoPoint = { lat: 25.0772, lng: 121.2326 };
export const TAIPEI_101: GeoPoint = { lat: 25.03396, lng: 121.56447 };
export const XINYI: GeoPoint = { lat: 25.0368, lng: 121.567 };

/** Highway-ish corridor TPE → Xinyi. Prototype geometry for the shared event layer. */
export const ROUTE_TPE_TPE101: GeoPoint[] = [
  TPE_T1,
  { lat: 25.0748, lng: 121.2488 },
  { lat: 25.0684, lng: 121.2715 },
  { lat: 25.0611, lng: 121.2984 },
  { lat: 25.0556, lng: 121.3281 },
  { lat: 25.0512, lng: 121.3592 },
  { lat: 25.0478, lng: 121.3924 },
  { lat: 25.0441, lng: 121.4266 },
  { lat: 25.0408, lng: 121.4612 },
  { lat: 25.0382, lng: 121.4948 },
  { lat: 25.0361, lng: 121.5284 },
  { lat: 25.0346, lng: 121.5488 },
  TAIPEI_101,
];

export const APPROACH_DAVID: GeoPoint[] = [
  { lat: 25.0412, lng: 121.2014 },
  { lat: 25.0526, lng: 121.2108 },
  { lat: 25.0634, lng: 121.2196 },
  { lat: 25.0718, lng: 121.2268 },
  TPE_T1,
];

export function lerp(a: GeoPoint, b: GeoPoint, t: number): GeoPoint {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export function along(path: GeoPoint[], t: number): GeoPoint {
  if (path.length === 0) return TPE_T1;
  const x = Math.min(1, Math.max(0, t)) * (path.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  return lerp(a, b, f);
}

export function haversine(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function heading(a: GeoPoint, b: GeoPoint) {
  const y = Math.sin(((b.lng - a.lng) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.cos(((b.lng - a.lng) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function remainingKm(path: GeoPoint[], t: number, dest: GeoPoint) {
  return haversine(along(path, t), dest);
}
