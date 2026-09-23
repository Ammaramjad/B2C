import { HOURLY_RATE, NIGHT_RATE, SURGE, extras as extraCat, promos, rentals, taxis, vehicles } from "./catalog.ts";
import type { Currency, ExtraId, LineItem, ServiceType } from "./types.ts";

const FX: Record<Currency, number> = { TWD: 1, USD: 0.031 };

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

export function isNight(when: string) {
  if (!when) return false;
  const h = new Date(when).getHours();
  return h >= 23 || h < 6;
}

export function quote(opts: {
  service: ServiceType;
  vehicle: string;
  extras?: ExtraId[];
  promo?: string;
  when?: string;
  hours?: number;
  days?: number;
  surge?: boolean;
}) {
  let base = vehicles.find((v) => v.id === opts.vehicle)?.base ?? 1280;
  if (opts.service === "hourly") base = HOURLY_RATE * (opts.hours ?? 4);
  if (opts.service === "rental") base = (rentals.find((r) => r.id === opts.vehicle)?.day ?? 1680) * (opts.days ?? 1);
  if (opts.service === "instant") base = taxis.find((t) => t.id === opts.vehicle)?.base ?? 185;

  const extraRows = (opts.extras ?? [])
    .map((id) => extraCat.find((e) => e.id === id))
    .filter(Boolean)
    .map((e) => ({ label: e!.name, labelZh: e!.nameZh, amount: e!.price }));
  const extraSum = extraRows.reduce((s, i) => s + i.amount, 0);
  const night = isNight(opts.when ?? "") && opts.service !== "rental" ? Math.round(base * NIGHT_RATE) : 0;
  const surgeAmt = opts.surge ? Math.round(base * (SURGE - 1)) : 0;
  const sub = base + extraSum + night + surgeAmt;
  const p = opts.promo ? promos[opts.promo as keyof typeof promos] : undefined;
  const discount = p ? (p.type === "flat" ? p.amount : Math.round(sub * p.amount)) : 0;
  const total = Math.max(0, sub - discount);

  const items: LineItem[] = [
    { label: "Base fare", labelZh: "基礎車資", amount: base },
    ...extraRows,
    { label: "Night +20% (23:00–06:00)", labelZh: "夜間加成 20%", amount: night },
    { label: "Surge ×1.15", labelZh: "動態加價 15%", amount: surgeAmt },
    { label: "Promo", labelZh: "促銷折扣", amount: -discount },
    { label: "Service fee (included 4%)", labelZh: "服務費（已內含 4%）", amount: 0 },
    { label: "Tolls (actual)", labelZh: "過路費（實報實銷）", amount: 0 },
    { label: "Parking (actual)", labelZh: "停車費（實報實銷）", amount: 0 },
  ];
  return { items, total, base, extraSum, night, surgeAmt, discount };
}

export { cancelFee } from "./domain/fees.ts";

export { COMMISSION } from "./catalog";
