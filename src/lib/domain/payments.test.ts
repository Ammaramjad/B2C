import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cancelFee } from "./fees.ts";
import { canPaymentTransition, financeTotals, type PaymentRecord, type WalletTx } from "./payments.ts";
import { resolveBooking, TAPE_BOOKING_ID } from "./booking.ts";
import { resolveShare, mintShareToken } from "./share.ts";
import { canPreferredTransition, normalizePreferred } from "./preferred-flow.ts";
import { initialSnapshot } from "../live/seed.ts";
import { productionPersist } from "./persist.ts";

describe("booking resolution", () => {
  it("does not resolve an unknown id to ZF-82041", () => {
    const live = initialSnapshot();
    assert.equal(resolveBooking("ZF-UNKNOWN", [], live), null);
    assert.equal(resolveBooking("ZF-NOPE", [{ id: "ZD-1" } as never], live), null);
    const tape = resolveBooking(TAPE_BOOKING_ID, [], live);
    assert.equal(tape?.id, TAPE_BOOKING_ID);
  });

  it("prefers a persisted row over the tape synthesizer", () => {
    const live = initialSnapshot();
    const persisted = { id: TAPE_BOOKING_ID, pickup: "Persisted curb", price: 1 } as never;
    const hit = resolveBooking(TAPE_BOOKING_ID, [persisted], live);
    assert.equal(hit?.pickup, "Persisted curb");
  });
});

describe("preferred transitions", () => {
  it("blocks immediate confirm from pending", () => {
    assert.equal(normalizePreferred("requested"), "pending");
    assert.equal(canPreferredTransition("pending", "confirmed"), false);
    assert.equal(canPreferredTransition("pending", "under_review"), true);
    assert.equal(canPreferredTransition("company_offered", "confirmed"), true);
  });
});

describe("payments + cancelFee bands", () => {
  it("derives finance totals from records", () => {
    const payments: PaymentRecord[] = [
      { id: "a", bookingId: "B1", customer: "A", method: "card", provider: "simulation", amount: 1000, currency: "TWD", status: "captured", source: "demo", timestamp: "t" },
      { id: "b", bookingId: "B2", customer: "A", method: "card", provider: "simulation", amount: 400, currency: "TWD", status: "refunded", source: "demo", timestamp: "t" },
    ];
    const wallet: WalletTx[] = [
      { id: "w1", passengerId: "p1", type: "credit", amount: 200, currency: "TWD", timestamp: "t", status: "posted", source: "demo", reference: "open" },
      { id: "w2", passengerId: "p1", type: "debit", amount: 50, currency: "TWD", timestamp: "t", status: "posted", source: "demo", reference: "B1" },
    ];
    const t = financeTotals(payments, wallet);
    assert.equal(t.captured, 1000);
    assert.equal(t.refunded, 400);
    assert.equal(t.walletBalance, 150);
    assert.notEqual(t.captured, 84);
  });

  it("uses cancelFee across windows", () => {
    assert.equal(cancelFee(30, 2680), 0);
    assert.equal(cancelFee(8, 2680, 0.5), Math.round(2680 * 0.5));
    assert.equal(cancelFee(2, 2680), 2680);
    assert.equal(cancelFee(0, 1000), 1000);
    assert.equal(canPaymentTransition("authorized", "captured"), true);
    assert.equal(canPaymentTransition("failed", "captured"), false);
  });
});

describe("share tokens", () => {
  it("rejects unknown and expired tokens", () => {
    const rec = mintShareToken("ZF-1", 1_000);
    assert.equal(resolveShare("nope", [rec], 1_100).status, "unknown");
    assert.equal(resolveShare(rec.token, [rec], rec.expiresAt + 1).status, "expired");
    assert.equal(resolveShare(rec.token, [rec], rec.createdAt + 10).status, "ok");
  });
});

describe("production persist", () => {
  it("throws when unconfigured", async () => {
    await assert.rejects(() => productionPersist.save(null as never), /not configured/);
  });
});
