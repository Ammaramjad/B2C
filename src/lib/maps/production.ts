import type { GeoProvider } from "./types.ts";

/** Production GPS/routing/traffic adapters. Unconfigured until a real vendor is wired. */
export const productionProvider: GeoProvider = {
  id: "production",
  tiles: {
    day: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    night: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  },
  async geocode() {
    throw new Error("Production geocoding is not configured");
  },
  async route() {
    throw new Error("Production routing is not configured");
  },
  async eta() {
    throw new Error("Production ETA is not configured");
  },
  async traffic() {
    throw new Error("Production traffic is not configured");
  },
};
