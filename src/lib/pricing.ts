import { vehicles } from "./data";
import type { Currency, LineItem, ServiceType, VehicleClass } from "./types";

const FX: Record<Currency, number> = {
  TWD: 1,
  USD: 0.031,
};

export function convert(twd: number, currency: Currency) {
  if (currency === "USD") return Math.round(twd * FX.USD * 100) / 100;
  return Math.round(twd);
}

export function money(amount: number, currency: Currency) {
  if (currency === "USD") {
    return `US$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `NT$${Math.round(amount).toLocaleString("zh-TW")}`;
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
    { label: "Base fare", labelZh: "基本車資", amount: Math.round(base * v.multiplier) },
  ];
  if (opts.airport || opts.service === "airport") {
    items.push({ label: "Airport access + meet", labelZh: "機場接駁與舉牌", amount: 280 });
  }
  if (opts.night) items.push({ label: "Night / peak", labelZh: "夜間／尖峰加成", amount: 220 });
  items.push({
    label: "Demand & weather (16-factor)",
    labelZh: "供需與天候（16 因子）",
    amount: Math.round(base * (demand - 1)),
  });
  if (opts.preferredDriver) {
    items.push({ label: "Designated driver +18%", labelZh: "指定司機 +18%", amount: Math.round(base * 0.18) });
  }
  const total = items.reduce((s, i) => s + i.amount, 0);
  return { items, total, km, hours };
}

export function cancelFee(hoursBefore: number, total: number) {
  if (hoursBefore >= 24) return 0;
  if (hoursBefore >= 12) return Math.round(total * 0.5);
  return total;
}

export const COMMISSION = 0.2;
