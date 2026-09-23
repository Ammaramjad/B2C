import { vehicles } from "./data";
import type { Currency, LineItem, ServiceType, VehicleClass } from "./types";

const FX: Record<Currency, number> = {
  TWD: 1,
  USD: 0.031,
  JPY: 4.6,
  KRW: 42,
  INR: 2.7,
};

export function convert(twd: number, currency: Currency) {
  return Math.round(twd * FX[currency]);
}

export function money(amount: number, currency: Currency) {
  const map: Record<Currency, [string, string]> = {
    TWD: ["NT$", "zh-TW"],
    USD: ["$", "en-US"],
    JPY: ["¥", "ja-JP"],
    KRW: ["₩", "ko-KR"],
    INR: ["₹", "en-IN"],
  };
  const [sym] = map[currency];
  return `${sym}${amount.toLocaleString()}`;
}

export function quote(opts: {
  service: ServiceType;
  vehicle: VehicleClass;
  km?: number;
  night?: boolean;
  airport?: boolean;
  hours?: number;
  preferredDriver?: boolean;
  demand?: number;
}) {
  const v = vehicles.find((x) => x.id === opts.vehicle) ?? vehicles[0];
  const km = opts.km ?? (opts.service === "airport" ? 42 : 18);
  const hours = opts.hours ?? 8;
  const demand = opts.demand ?? 1.08;
  let base = 680 + km * 28;
  if (opts.service === "charter") base = 4200 + Math.max(0, hours - 4) * 680;
  if (opts.service === "taxi") base = 220 + km * 22;
  if (opts.service === "rental") base = 2600 + hours * 180;
  if (opts.service === "designated") base = 1800 + hours * 320;
  if (opts.service === "experience") base = 5400;

  const items: LineItem[] = [
    { label: "Base orbit fare", amount: Math.round(base * v.multiplier) },
  ];
  if (opts.airport || opts.service === "airport") {
    items.push({ label: "Airport access + meet", amount: 280 });
  }
  if (opts.night) items.push({ label: "Night / peak pulse", amount: 220 });
  items.push({ label: "Demand & weather (16-factor)", amount: Math.round(base * (demand - 1)) });
  if (opts.preferredDriver) items.push({ label: "Designated driver +18%", amount: Math.round(base * 0.18) });
  const total = items.reduce((s, i) => s + i.amount, 0);
  return { items, total, km, hours };
}

export function cancelFee(hoursBefore: number, total: number) {
  if (hoursBefore >= 24) return 0;
  if (hoursBefore >= 12) return Math.round(total * 0.5);
  return total;
}

export const statusFlow = [
  "draft",
  "confirmed",
  "assigned",
  "en_route",
  "arrived",
  "in_progress",
  "completed",
] as const;
