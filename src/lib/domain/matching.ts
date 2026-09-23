export type Fit = {
  id: string;
  seats: number;
  luggage: number;
  title: string;
  price: number;
};

export function capacityNote(opts: {
  passengers: number;
  luggage: number;
  vehicle: Fit;
  locale: "en" | "zh";
  alternatives: Fit[];
}) {
  const ok = opts.passengers <= opts.vehicle.seats && opts.luggage <= opts.vehicle.luggage;
  if (ok) return null;
  const rec = opts.alternatives.find((v) => v.seats >= opts.passengers && v.luggage >= opts.luggage);
  if (opts.locale === "zh") {
    return rec
      ? `這台車可載 ${opts.vehicle.seats} 人、${opts.vehicle.luggage} 件行李。您有 ${opts.passengers} 人、${opts.luggage} 件行李，建議改選 ${rec.title}。`
      : `這台車可載 ${opts.vehicle.seats} 人、${opts.vehicle.luggage} 件行李，無法承載目前人數或行李。`;
  }
  return rec
    ? `This vehicle supports ${opts.vehicle.seats} passengers and ${opts.vehicle.luggage} standard bags. For your party of ${opts.passengers} with ${opts.luggage} bags, ${rec.title} is recommended.`
    : `This vehicle supports ${opts.vehicle.seats} passengers and ${opts.vehicle.luggage} bags — it cannot take this party.`;
}

export function fitLabel(opts: { seats: number; luggage: number; price: number; passengers: number; bags: number; cheapest: number; locale: "en" | "zh" }) {
  if (opts.passengers <= opts.seats && opts.bags <= opts.luggage && opts.price === opts.cheapest && opts.seats <= opts.passengers + 1) {
    return opts.locale === "zh" ? "最划算" : "Best value";
  }
  if (opts.luggage - opts.bags >= 2) return opts.locale === "zh" ? "行李空間大" : "More luggage space";
  if (opts.seats >= 6) return opts.locale === "zh" ? "適合多人" : "Large group";
  if (opts.price >= 2500) return opts.locale === "zh" ? "豪華舒適" : "Premium comfort";
  if (opts.passengers <= opts.seats && opts.bags <= opts.luggage) return opts.locale === "zh" ? "建議" : "Recommended";
  return null;
}

export function explainDispatch(opts: { fleet: "A" | "B" | "C"; rating: number; name: string; locale: "en" | "zh" }) {
  const fleet = { A: opts.locale === "zh" ? "自營車隊 A" : "Company fleet A", B: opts.locale === "zh" ? "加盟 B" : "Affiliate fleet B", C: opts.locale === "zh" ? "合作 C" : "Partner fleet C" }[opts.fleet];
  return opts.locale === "zh"
    ? `選擇 ${opts.name}：車隊優先序 ${fleet}，評分 ${opts.rating.toFixed(2)}，符合車型與在線條件。`
    : `${opts.name} selected: fleet priority ${fleet}, rating ${opts.rating.toFixed(2)}, eligible vehicle and online.`;
}
