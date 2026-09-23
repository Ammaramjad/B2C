import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mismatchCopy, recommendFor, vehicleFits } from "./capacity.ts";

describe("capacity matching", () => {
  it("rejects sedan for 5 pax / 4 bags and recommends larger classes", () => {
    assert.equal(vehicleFits("Sedan", 5, 4), false);
    assert.equal(vehicleFits("MPV", 5, 4), true);
    const rec = recommendFor(5, 4);
    assert.ok(rec.includes("MPV"));
    assert.ok(rec.includes("Van"));
    const copy = mismatchCopy("Sedan", 5, 4);
    assert.match(String(copy), /Sedan supports up to 3 passengers and 3 standard bags/);
  });
});
