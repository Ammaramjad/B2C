import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyAcceptOffer, applyConfirmAirport, applyIncident, applyPreferredRequest, applyPreferredStatus, applySendOffer } from "./actions.ts";
import { pickupBeat } from "./scenario.ts";
import { initialSnapshot } from "./seed.ts";
import { CUSTOMER_REASSIGN_COPY } from "./preferred.ts";
import { resetEventSeq } from "./events.ts";

describe("incident to replacement", () => {
  it("raises a critical incident and requires a company offer before reassignment", () => {
    resetEventSeq();
    let s = initialSnapshot();
    s = pickupBeat(s, 2);
    s = applyIncident(s, "Unable to continue trip", "Warning light");
    assert.equal(s.phase, "disrupted");
    assert.equal(s.incident?.severity, "critical");
    assert.ok(s.candidates.length >= 1);
    assert.equal(s.assignedId, "D-118");

    s = applySendOffer(s, s.candidates[0].id);
    assert.equal(s.phase, "reassigning");
    assert.equal(s.offerTo, s.candidates[0].id);
    assert.equal(s.assignedId, "D-118");

    s = applyAcceptOffer(s);
    assert.equal(s.phase, "reassigned");
    assert.equal(s.assignedId, s.candidates[0].id);
    assert.equal(s.customerNotice, CUSTOMER_REASSIGN_COPY);
    assert.ok(s.events.some((e) => e.type === "dispatch.reassigned"));
  });

  it("binds a paid booking onto the live tape", () => {
    resetEventSeq();
    const s = applyConfirmAirport(initialSnapshot(), {
      flight: "BR156",
      pax: 5,
      bags: 4,
      vehicle: "MPV",
      fare: 2480,
      bookingId: "ZF-TEST",
      name: "Sarah Chen",
    });
    assert.equal(s.bookingId, "ZF-TEST");
    assert.equal(s.phase, "booked");
    assert.ok(s.events.some((e) => e.type === "booking.created"));
  });

  it("keeps preferred confirmation company-mediated", () => {
    resetEventSeq();
    let s = applyPreferredRequest(initialSnapshot(), "D-118");
    s = applyPreferredStatus(s, "validating");
    s = applyPreferredStatus(s, "offered");
    s = applyPreferredStatus(s, "confirmed");
    assert.equal(s.preferred?.status, "confirmed");
    assert.equal(s.assignedId, "D-118");
    assert.ok(s.events.some((e) => e.type === "preferred.confirmed"));
  });
});
