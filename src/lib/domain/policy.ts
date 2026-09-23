/** Commercial policy lives here — not in UI components. Values are demo defaults. */

export const policy = {
  timezone: "Asia/Taipei",
  settlementCurrency: "TWD" as const,
  night: { startHour: 23, endHour: 6, surchargePct: 0.2 },
  hourly: { minHours: 4, maxHours: 12, rateTwd: 880 },
  rental: { minDays: 1, maxDays: 14 },
  airportWait: { freeMinutes: 60, notes: "Configurable. v10 used 45; v12.1 baseline 60." },
  cancellation: {
    freeAfterHours: 24,
    partialAfterHours: 6,
    partialPct: 0.5,
  },
  commissionPct: 0.2,
  surge: { multiplier: 1.15, mode: "shadow" as const },
  fleetPriority: ["A", "B", "C"] as const,
  designatedDriver: {
    directPct: 0.18,
    timeslotPct: 0.12,
    premiumVehiclePct: 0.25,
  },
  pricing2: {
    floorPct: 0.85,
    ceilingPct: 1.45,
    mode: "shadow" as const,
  },
};

export function hoursUntil(when: string) {
  return Math.max(0, (new Date(when).getTime() - Date.now()) / 36e5);
}

export function cancellationConsequence(when: string, total: number, midPct = policy.cancellation.partialPct) {
  const hours = hoursUntil(when);
  if (hours >= policy.cancellation.freeAfterHours) {
    return { fee: 0, refund: total, tier: "free" as const, hours };
  }
  if (hours >= policy.cancellation.partialAfterHours) {
    const fee = Math.round(total * midPct);
    return { fee, refund: total - fee, tier: "partial" as const, hours };
  }
  return { fee: total, refund: 0, tier: "none" as const, hours };
}
