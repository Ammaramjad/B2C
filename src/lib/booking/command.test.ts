import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAdvance, initialCommand, reduceCommand } from "./command.ts";

describe("booking command", () => {
  it("starts on route and advances only with from/to", () => {
    const blank = initialCommand({ from: { label: "", point: null, source: "user" }, to: { label: "", point: null, source: "user" } });
    assert.equal(blank.step, 1);
    assert.equal(canAdvance(blank), false);
    const next = reduceCommand(blank, { type: "next" });
    assert.equal(next.step, 1);
    const filled = reduceCommand(blank, { type: "from", place: { label: "TPE", point: { lat: 25, lng: 121 }, source: "catalog" } });
    const both = reduceCommand(filled, { type: "to", place: { label: "101", point: { lat: 25.03, lng: 121.56 }, source: "catalog" } });
    assert.equal(canAdvance(both), true);
    assert.equal(reduceCommand(both, { type: "next" }).step, 2);
  });

  it("swaps locations and toggles extras without inventing a route", () => {
    const s = initialCommand();
    const swapped = reduceCommand(s, { type: "swap" });
    assert.equal(swapped.from.label, s.to.label);
    assert.equal(swapped.to.label, s.from.label);
    assert.equal(swapped.route, null);
    const extras = reduceCommand(s, { type: "toggleExtra", id: "child_seat" });
    assert.ok(extras.extras.includes("child_seat"));
    const off = reduceCommand(extras, { type: "toggleExtra", id: "child_seat" });
    assert.ok(!off.extras.includes("child_seat"));
  });

  it("supports schedule and multi-stop without skipping payment", () => {
    let s = reduceCommand(initialCommand(), { type: "mode", mode: "multi" });
    s = reduceCommand(s, { type: "addStop" });
    assert.equal(s.stops.length, 1);
    s = reduceCommand(s, { type: "step", step: 5 });
    assert.equal(s.step, 5);
    s = reduceCommand(s, { type: "patch", patch: { payment: "line" } });
    assert.equal(s.payment, "line");
  });
});
