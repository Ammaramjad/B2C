import type { Booking, Driver } from "../types.ts";
import type { PunctualityRecord } from "../domain/persist.ts";
import type { LiveDriver } from "./types.ts";

export type DriverScorecard = {
  id: string;
  name: string;
  totalRides: number | null;
  completedRides: number | null;
  cancelledRides: number | null;
  rejectedOffers: number | null;
  onTimePickups: number | null;
  latePickups: number | null;
  totalLateMinutes: number | null;
  averageLateMinutes: number | null;
  acceptanceRate: number | null;
  completionRate: number | null;
  cancellationRate: number | null;
  rating: number | null;
  incidentCount: number | null;
};

function rate(part: number, whole: number) {
  if (whole <= 0) return null;
  return Number((part / whole).toFixed(3));
}

export type ScoreExtras = {
  rejects?: number;
  punctuality?: Pick<PunctualityRecord, "lateMin" | "driverId">[];
  offersSent?: number;
};

function punctualityFor(id: string, rows: ScoreExtras["punctuality"]) {
  const mine = (rows ?? []).filter((r) => r.driverId === id);
  if (!mine.length) {
    return { onTimePickups: null, latePickups: null, totalLateMinutes: null, averageLateMinutes: null };
  }
  const late = mine.filter((r) => r.lateMin > 0);
  const totalLate = late.reduce((s, r) => s + r.lateMin, 0);
  return {
    onTimePickups: mine.length - late.length,
    latePickups: late.length,
    totalLateMinutes: totalLate,
    averageLateMinutes: late.length ? Number((totalLate / late.length).toFixed(1)) : 0,
  };
}

/** Ledger + recorded rejects/punctuality only. Missing values stay null. Catalog lifetime trips are not copied in. */
export function scorecardFromCatalog(driver: Driver, bookings: Booking[], incidentCount?: number, extras?: ScoreExtras): DriverScorecard {
  const mine = bookings.filter((b) => b.driverId === driver.id || b.driverId === aliasOf(driver.id));
  const completed = mine.filter((b) => b.status === "completed").length;
  const cancelled = mine.filter((b) => b.status === "cancelled").length;
  const p = punctualityFor(driver.id, extras?.punctuality);
  const rejects = extras?.rejects;
  const sent = extras?.offersSent;
  return {
    id: driver.id,
    name: driver.name,
    totalRides: mine.length ? mine.length : null,
    completedRides: mine.length ? completed : null,
    cancelledRides: mine.length ? cancelled : null,
    rejectedOffers: rejects == null ? null : rejects,
    onTimePickups: p.onTimePickups,
    latePickups: p.latePickups,
    totalLateMinutes: p.totalLateMinutes,
    averageLateMinutes: p.averageLateMinutes,
    acceptanceRate: sent && rejects != null ? rate(sent - rejects, sent) : driver.acceptRate,
    completionRate: mine.length ? rate(completed, mine.length) : null,
    cancellationRate: mine.length ? rate(cancelled, mine.length) : null,
    rating: driver.rating,
    incidentCount: incidentCount ?? null,
  };
}

function aliasOf(id: string) {
  if (id === "D-118" || id === "d3") return id === "D-118" ? "d3" : "D-118";
  if (id === "d1") return "D-118";
  return id;
}

export function scorecardFromLive(d: LiveDriver, incidentCount?: number, extras?: ScoreExtras): DriverScorecard {
  const p = punctualityFor(d.id, extras?.punctuality);
  return {
    id: d.id,
    name: d.name,
    totalRides: null,
    completedRides: null,
    cancelledRides: null,
    rejectedOffers: extras?.rejects ?? null,
    onTimePickups: p.onTimePickups,
    latePickups: p.latePickups,
    totalLateMinutes: p.totalLateMinutes,
    averageLateMinutes: p.averageLateMinutes,
    acceptanceRate: d.accept,
    completionRate: null,
    cancellationRate: null,
    rating: d.rating,
    incidentCount: incidentCount ?? null,
  };
}

export function mergeScorecards(catalog: DriverScorecard, live: DriverScorecard): DriverScorecard {
  return {
    id: live.id,
    name: live.name,
    totalRides: catalog.totalRides,
    completedRides: catalog.completedRides,
    cancelledRides: catalog.cancelledRides,
    rejectedOffers: live.rejectedOffers ?? catalog.rejectedOffers,
    onTimePickups: catalog.onTimePickups ?? live.onTimePickups,
    latePickups: catalog.latePickups ?? live.latePickups,
    totalLateMinutes: catalog.totalLateMinutes ?? live.totalLateMinutes,
    averageLateMinutes: catalog.averageLateMinutes ?? live.averageLateMinutes,
    acceptanceRate: live.acceptanceRate ?? catalog.acceptanceRate,
    completionRate: catalog.completionRate,
    cancellationRate: catalog.cancellationRate,
    rating: live.rating ?? catalog.rating,
    incidentCount: live.incidentCount ?? catalog.incidentCount,
  };
}

export function formatMetric(n: number | null, kind: "int" | "pct" | "min" = "int") {
  if (n == null) return "Not enough data";
  if (kind === "pct") return `${Math.round(n * 100)}%`;
  if (kind === "min") return `${n}`;
  return String(n);
}
