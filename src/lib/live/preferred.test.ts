import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePreferred } from "./preferred.ts";

describe("preferred driver company gate", () => {
  it("passes a valid company-mediated request", () => {
    const r = validatePreferred({
      available: true,
      inServiceArea: true,
      klass: "MPV",
      pax: 5,
      bags: 4,
      scheduleConflict: false,
      companyRuleOk: true,
      premiumPct: 18,
    });
    assert.equal(r.ok, true);
  });

  it("rejects private-style bypass conditions", () => {
    const r = validatePreferred({
      available: false,
      inServiceArea: true,
      klass: "Sedan",
      pax: 5,
      bags: 4,
      scheduleConflict: true,
      companyRuleOk: true,
      premiumPct: 40,
    });
    assert.equal(r.ok, false);
    assert.ok(r.reasons.length >= 3);
  });
});
