import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canOfferTransition, isOfferExpired, nextOfferState, remainSec } from "./offer.ts";

describe("offer state machine", () => {
  it("allows offered → accepted / rejected / expired and blocks terminal reversals", () => {
    assert.equal(canOfferTransition("offered", "accepted"), true);
    assert.equal(canOfferTransition("offered", "rejected"), true);
    assert.equal(canOfferTransition("expired", "accepted"), false);
    assert.equal(canOfferTransition("rejected", "accepted"), false);
    assert.equal(canOfferTransition("accepted", "rejected"), false);
  });

  it("derives countdown from expiresAt and treats past stamps as expired", () => {
    const now = 1_000_000;
    assert.equal(remainSec(now + 12_000, now), 12);
    assert.equal(isOfferExpired(now - 1, now), true);
    assert.equal(nextOfferState("offered", "accepted", now - 1, now), null);
    assert.equal(nextOfferState("offered", "accepted", now + 5_000, now), "accepted");
  });
});
