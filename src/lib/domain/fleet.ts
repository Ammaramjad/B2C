import { drivers } from "../data.ts";
import { vehicles } from "../catalog.ts";
import { capacityFor } from "../live/capacity.ts";

export type FleetCompany = {
  id: "A" | "B" | "C";
  name: string;
  priority: "First" | "Second" | "Fill";
};

export const FLEET_COMPANIES: FleetCompany[] = [
  { id: "A", name: "Fleet A · primary", priority: "First" },
  { id: "B", name: "Fleet B · overflow", priority: "Second" },
  { id: "C", name: "Fleet C · fill", priority: "Fill" },
];

export function fleetRoster() {
  return FLEET_COMPANIES.map((c) => {
    const members = drivers.filter((d) => d.fleet === c.id);
    return {
      ...c,
      drivers: members.map((d) => ({
        id: d.id,
        name: d.name,
        vehicleClass: d.vehicleClass,
        plate: d.plate,
        work: d.work,
        seats: capacityFor(d.vehicleClass).seats,
        bags: capacityFor(d.vehicleClass).bags,
      })),
      classes: [...new Set(members.map((d) => d.vehicleClass))],
      catalogClasses: vehicles.filter((v) => members.some((d) => d.vehicleClass === v.id)).map((v) => v.id),
    };
  });
}

export const productionFleetWrite = {
  async assign() {
    throw new Error("Production fleet management is not configured");
  },
};
