import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveCounters, phaseToStatus, resolveBooking, TAPE_BOOKING_ID } from "./booking.ts";
import { mintShareToken } from "./share.ts";
import { initialSnapshot } from "../live/seed.ts";
import { applyRejectOffer, applySendOffer, applyShareTrip } from "../live/actions.ts";
import { resetEventSeq } from "../live/events.ts";
import { scorecardFromCatalog } from "../live/metrics.ts";
import type { Booking, Driver } from "../types.ts";

describe("canonical booking", () => {
  it("maps live phases onto booking status", () => {
    assert.equal(phaseToStatus("reassigned"), "assigned");
    assert.equal(phaseToStatus("trip_started"), "onboard");
    assert.equal(phaseToStatus("completed"), "completed");
  });

  it("resolves the tape booking when the store row is missing", () => {
    const live = initialSnapshot();
    const b = resolveBooking(TAPE_BOOKING_ID, [], live);
    assert.ok(b);
    assert.equal(b?.pickup, live.pickup);
    assert.ok(b?.price);
    assert.equal(resolveBooking("ZF-NOT-REAL", [], live), null);
  });

  it("derives counters from live drivers and bookings instead of seed constants", () => {
    const live = initialSnapshot();
    const c = deriveCounters(live, []);
    assert.equal(c.available, live.drivers.filter((d) => d.state === "available" && d.duty === "online").length);
    assert.notEqual(c.available, 64);
  });
});

describe("offer reject and share", () => {
  it("records a reject event and increments rejects", () => {
    resetEventSeq();
    let s = applySendOffer(initialSnapshot(), "D-221");
    assert.ok(s.offerExpiresAt);
    s = applyRejectOffer(s, "D-221");
    assert.equal(s.rejects["D-221"], 1);
    assert.equal(s.offerTo, null);
    assert.ok(s.events.some((e) => e.type === "dispatch.offer.rejected"));
  });

  it("mints a share token onto the tape", () => {
    resetEventSeq();
    const rec = mintShareToken("ZF-82041");
    const s = applyShareTrip(initialSnapshot(), rec.token);
    assert.equal(s.shareToken, rec.token);
    assert.ok(s.events.some((e) => e.type === "trip.shared"));
  });
});

describe("driver scorecard extras", () => {
  it("uses ledger + punctuality and does not invent late minutes", () => {
    const driver = { id: "d1", name: "Kenji", trips: 2140, acceptRate: 0.97, rating: 4.9, completedWeek: 19, cancelledWeek: 1 } as Driver;
    const bookings = [
      { id: "ZD-1", driverId: "d1", status: "completed", passengerId: "p1" },
      { id: "ZD-2", driverId: "d1", status: "cancelled", passengerId: "p1" },
    ] as Booking[];
    const card = scorecardFromCatalog(driver, bookings, 1, {
      rejects: 2,
      punctuality: [
        { driverId: "d1", lateMin: 0 },
        { driverId: "d1", lateMin: 7 },
      ],
    });
    assert.equal(card.totalRides, 2);
    assert.equal(card.rejectedOffers, 2);
    assert.equal(card.latePickups, 1);
    assert.equal(card.totalLateMinutes, 7);
    assert.notEqual(card.totalRides, 2140);
  });
});
