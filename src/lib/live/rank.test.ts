import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankReplacements } from "./rank.ts";
import { seedDrivers } from "./seed.ts";

describe("replacement ranking", () => {
  it("excludes the disrupted driver and sedans that cannot fit the party", () => {
    const ranked = rankReplacements(seedDrivers, { pax: 5, bags: 4, excludeIds: ["D-118"] });
    assert.ok(ranked.length >= 1);
    assert.ok(ranked.every((d) => d.id !== "D-118"));
    assert.ok(ranked.every((d) => d.klass === "MPV" || d.klass === "Van"));
    assert.ok(ranked.every((d) => d.state === "available"));
    assert.equal(ranked[0].id, "D-221");
  });
});
