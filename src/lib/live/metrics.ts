import type { Booking, Driver } from "../types.ts";
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

/** Only fields that exist on Driver / Booking / live incident counts. Missing values stay null. */
export function scorecardFromCatalog(driver: Driver, bookings: Booking[], incidentCount?: number): DriverScorecard {
  const mine = bookings.filter((b) => b.driverId === driver.id);
  const completed = mine.filter((b) => b.status === "completed").length;
  const cancelled = mine.filter((b) => b.status === "cancelled").length;
  const weekWhole = driver.completedWeek + driver.cancelledWeek;
  return {
    id: driver.id,
    name: driver.name,
    totalRides: driver.trips,
    completedRides: mine.length ? completed : driver.completedWeek,
    cancelledRides: mine.length ? cancelled : driver.cancelledWeek,
    rejectedOffers: null,
    onTimePickups: null,
    latePickups: null,
    totalLateMinutes: null,
    averageLateMinutes: null,
    acceptanceRate: driver.acceptRate,
    completionRate: mine.length ? rate(completed, mine.length) : rate(driver.completedWeek, weekWhole),
    cancellationRate: mine.length ? rate(cancelled, mine.length) : rate(driver.cancelledWeek, weekWhole),
    rating: driver.rating,
    incidentCount: incidentCount ?? null,
  };
}

export function scorecardFromLive(d: LiveDriver, incidentCount?: number): DriverScorecard {
  return {
    id: d.id,
    name: d.name,
    totalRides: null,
    completedRides: null,
    cancelledRides: null,
    rejectedOffers: null,
    onTimePickups: null,
    latePickups: null,
    totalLateMinutes: null,
    averageLateMinutes: null,
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
    rejectedOffers: catalog.rejectedOffers,
    onTimePickups: catalog.onTimePickups,
    latePickups: catalog.latePickups,
    totalLateMinutes: catalog.totalLateMinutes,
    averageLateMinutes: catalog.averageLateMinutes,
    acceptanceRate: live.acceptanceRate ?? catalog.acceptanceRate,
    completionRate: catalog.completionRate,
    cancellationRate: catalog.cancellationRate,
    rating: live.rating ?? catalog.rating,
    incidentCount: live.incidentCount ?? catalog.incidentCount,
  };
}

export function formatMetric(n: number | null, kind: "int" | "pct" | "min" = "int") {
  if (n == null) return "—";
  if (kind === "pct") return `${Math.round(n * 100)}%`;
  if (kind === "min") return `${n}`;
  return String(n);
}
