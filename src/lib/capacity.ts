import { vehicles } from "./catalog";
import type { Locale, VehicleClass } from "./types";

export function fits(id: string, passengers: number, luggage: number) {
  const v = vehicles.find((x) => x.id === id);
  if (!v) return true;
  return v.seats >= passengers && v.luggage >= luggage;
}

export function unfitNote(id: string, locale: Locale) {
  const v = vehicles.find((x) => x.id === id);
  if (!v) return "";
  return locale === "zh"
    ? `${v.nameZh}最多 ${v.seats} 位乘客、${v.luggage} 件標準行李。`
    : `${v.name} supports up to ${v.seats} passengers and ${v.luggage} standard bags.`;
}

export function ridePlan(passengers: number, luggage: number) {
  const fitting = vehicles.filter((v) => v.seats >= passengers && v.luggage >= luggage);
  const bySlack = [...fitting].sort(
    (a, b) => a.seats - passengers + (a.luggage - luggage) - (b.seats - passengers + (b.luggage - luggage)),
  );
  const byPrice = [...fitting].sort((a, b) => a.base - b.base);
  return {
    fitting,
    recommended: (bySlack[0]?.id ?? "mpv") as VehicleClass,
    bestValue: (byPrice[0]?.id ?? "mpv") as VehicleClass,
  };
}

export function rideTags(id: string, passengers: number, luggage: number, locale: Locale) {
  const plan = ridePlan(passengers, luggage);
  const tags: string[] = [];
  const say = (en: string, zh: string) => tags.push(locale === "zh" ? zh : en);
  if (id === plan.recommended) say("Recommended", "建議");
  if (id === plan.bestValue && id !== plan.recommended) say("Best value", "最優價格");
  if (id === "premium") say("Premium", "高級");
  if (id === "mpv" && passengers >= 4 && fits(id, passengers, luggage)) say("Best for families", "適合家庭");
  if (id === "van" && fits(id, passengers, luggage) && luggage >= 4) say("Best for luggage", "適合行李");
  if ((id === "van" || id === "shuttle") && passengers >= 6 && fits(id, passengers, luggage)) say("Best for groups", "適合團體");
  return tags.slice(0, 2);
}
