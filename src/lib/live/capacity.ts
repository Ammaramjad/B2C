import { vehicles } from "../catalog";

const klassToId: Record<string, string> = {
  Sedan: "sedan",
  Premium: "premium",
  SUV: "suv",
  MPV: "mpv",
  Van: "van",
  Shuttle: "shuttle",
};

export function capacityFor(klass: string) {
  const id = klassToId[klass] ?? klass.toLowerCase();
  const v = vehicles.find((x) => x.id === id);
  return { seats: v?.seats ?? 3, bags: v?.luggage ?? 3, id: v?.id ?? "sedan", name: v?.name ?? klass };
}

export function vehicleFits(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  return pax <= cap.seats && bags <= cap.bags;
}

export function recommendFor(pax: number, bags: number) {
  return vehicles
    .filter((v) => v.seats >= pax && v.luggage >= bags && v.id !== "shuttle")
    .sort((a, b) => a.base - b.base)
    .map((v) => v.name);
}

export function mismatchCopy(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  if (vehicleFits(klass, pax, bags)) return null;
  const rec = recommendFor(pax, bags);
  return `${cap.name} supports up to ${cap.seats} passengers and ${cap.bags} standard bags. For ${pax} passengers and ${bags} bags, Zoufeng recommends ${rec.slice(0, 2).join(" or ") || "a larger vehicle"}.`;
}
