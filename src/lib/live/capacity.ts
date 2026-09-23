const CLASSES: Record<string, { seats: number; bags: number; id: string; name: string }> = {
  sedan: { seats: 3, bags: 3, id: "sedan", name: "Sedan" },
  premium: { seats: 3, bags: 3, id: "premium", name: "Premium" },
  suv: { seats: 4, bags: 4, id: "suv", name: "SUV" },
  mpv: { seats: 6, bags: 6, id: "mpv", name: "MPV" },
  van: { seats: 8, bags: 8, id: "van", name: "Van" },
  shuttle: { seats: 10, bags: 1, id: "shuttle", name: "Shuttle" },
};

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
  return CLASSES[id] ?? CLASSES.sedan;
}

export function vehicleFits(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  return pax <= cap.seats && bags <= cap.bags;
}

export function recommendFor(pax: number, bags: number) {
  return Object.values(CLASSES)
    .filter((v) => v.seats >= pax && v.bags >= bags && v.id !== "shuttle")
    .sort((a, b) => a.seats - b.seats)
    .map((v) => v.name);
}

export function mismatchCopy(klass: string, pax: number, bags: number) {
  const cap = capacityFor(klass);
  if (vehicleFits(klass, pax, bags)) return null;
  const rec = recommendFor(pax, bags);
  return `${cap.name} supports up to ${cap.seats} passengers and ${cap.bags} standard bags. For ${pax} passengers and ${bags} bags, Zoufeng recommends ${rec.slice(0, 2).join(" or ") || "a larger vehicle"}.`;
}
