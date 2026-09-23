import type { GeoPoint } from "../live/types.ts";

export type GeoProviderId = "simulation" | "production";

export type RouteResult = { path: GeoPoint[]; km: number; etaMin: number; source: GeoProviderId };
export type TrafficResult = { level: "clear" | "heavy" | "incident"; note: string; source: GeoProviderId };
export type GeocodeResult = { point: GeoPoint; label: string; source: GeoProviderId } | null;

export type GeoProvider = {
  id: GeoProviderId;
  tiles: { day: string; night: string };
  geocode(query: string): Promise<GeocodeResult>;
  route(from: GeoPoint, to: GeoPoint): Promise<RouteResult>;
  eta(from: GeoPoint, to: GeoPoint): Promise<{ km: number; etaMin: number; source: GeoProviderId }>;
  traffic(): Promise<TrafficResult>;
  roadIncidents(): Promise<{ id: string; note: string; source: GeoProviderId }[]>;
};
