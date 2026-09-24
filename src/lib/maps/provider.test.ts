import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productionProvider } from "./production.ts";
import { resolveGeoProvider, simulationProvider } from "./index.ts";
import { TPE_T1 } from "../live/geo.ts";

describe("geo provider split", () => {
  it("defaults to the simulation provider and never claims production GPS", async () => {
    const p = resolveGeoProvider("simulation");
    assert.equal(p.id, "simulation");
    const traffic = await p.traffic();
    assert.equal(traffic.source, "simulation");
    assert.match(traffic.note, /SIMULATED/);
    const eta = await simulationProvider.eta(TPE_T1, { lat: 25.03396, lng: 121.56447 });
    assert.ok(eta.km > 0);
    assert.equal(eta.source, "simulation");
  });

  it("keeps production adapters unconfigured", async () => {
    await assert.rejects(() => productionProvider.geocode("TPE"), /not configured/);
    await assert.rejects(() => productionProvider.route(TPE_T1, TPE_T1), /not configured/);
  });

  it("does not treat community routing as production GPS", async () => {
    const p = resolveGeoProvider("community");
    assert.equal(p.id, "community");
    const traffic = await p.traffic();
    assert.equal(traffic.source, "community");
    assert.match(traffic.note, /no live traffic vendor/i);
  });
});
