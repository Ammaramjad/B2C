import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMetric, scorecardFromCatalog } from "./metrics.ts";
import type { Booking, Driver } from "../types.ts";

const driver = {
  id: "d1",
  name: "Kenji Mori",
  rating: 4.98,
  trips: 2140,
  acceptRate: 0.97,
  completedWeek: 19,
  cancelledWeek: 1,
} as Driver;

const bookings = [
  { id: "ZD-1", driverId: "d1", status: "completed", passengerId: "p1" },
  { id: "ZD-2", driverId: "d1", status: "cancelled", passengerId: "p1" },
  { id: "ZD-3", driverId: "d2", status: "completed", passengerId: "p2" },
] as Booking[];

describe("driver scorecard", () => {
  it("uses ledger rows and leaves unknown fields as not enough data", () => {
    const card = scorecardFromCatalog(driver, bookings, 1);
    assert.equal(card.totalRides, 2);
    assert.equal(card.completedRides, 1);
    assert.equal(card.cancelledRides, 1);
    assert.equal(card.rejectedOffers, null);
    assert.equal(card.latePickups, null);
    assert.equal(formatMetric(card.latePickups), "Not enough data");
    assert.equal(card.incidentCount, 1);
  });
});
