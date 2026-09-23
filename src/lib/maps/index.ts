import { productionProvider } from "./production.ts";
import { simulationProvider } from "./simulation.ts";
import type { GeoProvider, GeoProviderId } from "./types.ts";

export function resolveGeoProvider(id?: string): GeoProvider {
  const mode = (id ?? process.env.NEXT_PUBLIC_GEO_PROVIDER ?? "simulation") as GeoProviderId;
  if (mode === "production") return productionProvider;
  return simulationProvider;
}

export function activeGeoProviderId(): GeoProviderId {
  return resolveGeoProvider().id;
}

export { simulationProvider, productionProvider };
export type { GeoProvider, GeoProviderId } from "./types.ts";
