import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMetric, scorecardFromCatalog } from "./metrics.ts";
import type { Booking, Driver } from "../types.ts";

const driver = {
  id: "d1",
  name: "Kenji Mori",
  rating: 4.98,
  trips: 2140,
  vehicle: "Mercedes E-Class",
  vehicleClass: "premium",
  plate: "TPE-8801",
  city: "Taipei",
  work: "available",
  languages: ["EN"],
  photo: "KM",
  phone: "+886",
  license: "TW",
  fleet: "A",
  fuel: "hybrid",
  vehicleState: "active",
  status: "approved",
  joined: "2022-03-12",
  acceptRate: 0.97,
  earningsToday: 6240,
  earningsWeek: 42800,
  earningsMonth: 168400,
  earningsYtd: 1240800,
  pendingPayout: 34240,
  completedWeek: 19,
  cancelledWeek: 1,
  emptyKmWeek: 48,
  commissionRate: 0.2,
} as Driver;

const bookings = [
  { id: "ZD-1", driverId: "d1", status: "completed", passengerId: "p1" },
  { id: "ZD-2", driverId: "d1", status: "cancelled", passengerId: "p1" },
  { id: "ZD-3", driverId: "d2", status: "completed", passengerId: "p2" },
] as Booking[];

describe("driver scorecard", () => {
  it("uses catalog and booking rows and leaves unknown late metrics blank", () => {
    const card = scorecardFromCatalog(driver, bookings, 1);
    assert.equal(card.totalRides, 2140);
    assert.equal(card.completedRides, 1);
    assert.equal(card.cancelledRides, 1);
    assert.equal(card.acceptanceRate, 0.97);
    assert.equal(card.rejectedOffers, null);
    assert.equal(card.latePickups, null);
    assert.equal(card.totalLateMinutes, null);
    assert.equal(formatMetric(card.latePickups), "—");
    assert.equal(card.incidentCount, 1);
  });
});
