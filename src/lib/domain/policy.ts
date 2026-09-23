import { cancelFee, quote } from "../pricing.ts";
import { vehicleFits, recommendFor, capacityFor } from "../live/capacity.ts";
import type { ExtraId, ServiceType } from "../types.ts";

export type FareVersion = {
  id: string;
  status: "draft" | "preview" | "published" | "rolled_back";
  effective: string;
  note: string;
};

export type DynamicRule = {
  id: string;
  name: string;
  factor: string;
  multiplier: number;
  floor: number;
  ceiling: number;
  priority: number;
  enabled: boolean;
  shadow: boolean;
  period: string;
};

export type DispatchPolicy = {
  distanceWeight: number;
  etaWeight: number;
  fleetPriority: string;
  maxRadiusKm: number;
  offerTimeoutSec: number;
  autoAssign: boolean;
};

export type CancelBand = {
  service: ServiceType | "all";
  region: string;
  minHours: number;
  maxHours: number;
  feePct: number;
  refundPct: number;
};

export function simulateQuote(input: {
  service: ServiceType;
  vehicle: string;
  when?: string;
  hours?: number;
  days?: number;
  extras?: ExtraId[];
  promo?: string;
  surge?: boolean;
  distanceKm?: number;
  durationMin?: number;
}) {
  const q = quote(input);
  const distance = input.distanceKm ?? 0;
  const duration = input.durationMin ?? 0;
  const distanceAmt = input.service === "p2p" || input.service === "airport_pickup" || input.service === "airport_drop" ? Math.round(distance * 18) : 0;
  const timeAmt = input.service === "hourly" ? 0 : Math.round(duration * 4);
  const total = q.total + distanceAmt + timeAmt;
  return {
    ...q,
    distanceAmt,
    timeAmt,
    total,
    items: [
      ...q.items,
      { label: "Distance", labelZh: "里程", amount: distanceAmt },
      { label: "Time", labelZh: "時間", amount: timeAmt },
    ],
  };
}

export function simulateCancel(price: number, hoursBefore: number, midPct = 0.5) {
  const fee = cancelFee(hoursBefore, price, midPct);
  const refund = Math.max(0, price - fee);
  const band = hoursBefore >= 24 ? ">= 24h" : hoursBefore >= 6 ? "6–24h" : "< 6h";
  return { fee, refund, refundPct: price ? Math.round((refund / price) * 100) : 0, band };
}

export function capacityScenario(pax: number, bags: number, klasses = ["Sedan", "MPV", "Van", "SUV", "Premium"]) {
  return klasses.map((k) => ({
    klass: k,
    seats: capacityFor(k).seats,
    bags: capacityFor(k).bags,
    eligible: vehicleFits(k, pax, bags),
    recommend: recommendFor(pax, bags),
  }));
}

export const defaultDispatchPolicy: DispatchPolicy = {
  distanceWeight: 0.4,
  etaWeight: 0.3,
  fleetPriority: "A → B → C",
  maxRadiusKm: 12,
  offerTimeoutSec: 45,
  autoAssign: false,
};

export const defaultDynamicRules: DynamicRule[] = [
  { id: "night", name: "Night", factor: "clock", multiplier: 1.2, floor: 0, ceiling: 1.2, priority: 1, enabled: true, shadow: false, period: "23:00–06:00" },
  { id: "surge", name: "Corridor duplicate", factor: "demand", multiplier: 1.15, floor: 1, ceiling: 1.4, priority: 2, enabled: true, shadow: false, period: "when ≥2 same corridor" },
  { id: "weather", name: "Weather (provider)", factor: "weather", multiplier: 1.1, floor: 1, ceiling: 1.25, priority: 3, enabled: false, shadow: true, period: "advisory" },
];
