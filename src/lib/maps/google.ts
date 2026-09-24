import type { GeoProvider } from "./types.ts";

export function googleMapsKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}

/** Production Google adapter. Throws until NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set. */
export const googleProvider: GeoProvider = {
  id: "google",
  tiles: {
    day: "google-hybrid",
    night: "google-hybrid",
  },
  async geocode() {
    if (!googleMapsKey()) throw new Error("Google geocoding is not configured");
    throw new Error("Use the Maps JavaScript Places service in the browser map");
  },
  async route() {
    if (!googleMapsKey()) throw new Error("Google routing is not configured");
    throw new Error("Use the Maps JavaScript Directions service in the browser map");
  },
  async eta() {
    throw new Error("Google ETA is not configured");
  },
  async traffic() {
    if (!googleMapsKey()) throw new Error("Google traffic is not configured");
    return { level: "clear", note: "Google traffic layer · browser map", source: "google" };
  },
  async roadIncidents() {
    throw new Error("Google incidents is not configured");
  },
};
