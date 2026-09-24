import { communityProvider } from "./community.ts";
import { googleMapsKey, googleProvider } from "./google.ts";
import { productionProvider } from "./production.ts";
import { simulationProvider } from "./simulation.ts";
import type { GeoProvider, GeoProviderId } from "./types.ts";

export function resolveGeoProvider(id?: string): GeoProvider {
  const mode = (id ?? process.env.NEXT_PUBLIC_GEO_PROVIDER ?? "simulation") as GeoProviderId;
  if (mode === "production") return productionProvider;
  if (mode === "google") return googleProvider;
  if (mode === "community") return communityProvider;
  return simulationProvider;
}

/** Booking canvas: Google when keyed, otherwise community OSM/Esri — never silent production claims. */
export function resolveBookingGeoProvider(): GeoProvider {
  if (googleMapsKey()) return googleProvider;
  if (process.env.NEXT_PUBLIC_GEO_PROVIDER === "production") return productionProvider;
  return communityProvider;
}

export function activeGeoProviderId(): GeoProviderId {
  return resolveGeoProvider().id;
}

export { simulationProvider, productionProvider, communityProvider, googleProvider, googleMapsKey };
export type { GeoProvider, GeoProviderId } from "./types.ts";
