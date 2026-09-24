import { vehicles as seedVehicles } from "./catalog.ts";
import type { FareRow, ServiceType, Vehicle } from "./types.ts";

let runtimeVehicles: Vehicle[] = seedVehicles;
let runtimeFares: FareRow[] = [];

export function seedFares(): FareRow[] {
  return seedVehicles.flatMap((v) =>
    (["airport_pickup", "airport_drop", "p2p"] as ServiceType[]).map((service) => ({
      id: `FR-${v.id}-${service}`,
      service,
      vehicleId: v.id,
      base: v.base + (service === "p2p" ? -80 : 0),
      label: `${v.name} · ${service.replaceAll("_", " ")}`,
      labelZh: `${v.nameZh} · ${service}`,
    })),
  );
}

export function syncCatalog(vehicles: Vehicle[] | undefined, fares: FareRow[] | undefined) {
  runtimeVehicles = vehicles?.length ? vehicles : seedVehicles;
  runtimeFares = fares?.length ? fares : seedFares();
}

export function listVehicles() {
  return runtimeVehicles;
}

export function fareFor(service: string, vehicleId: string) {
  const hit = runtimeFares.find((f) => f.vehicleId === vehicleId && (f.service === service || f.service === "all"));
  if (hit) return hit.base;
  return runtimeVehicles.find((v) => v.id === vehicleId)?.base ?? 1280;
}

export function listFares() {
  return runtimeFares;
}
