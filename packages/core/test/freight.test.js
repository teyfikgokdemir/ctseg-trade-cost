import test from "node:test";
import assert from "node:assert/strict";
import { buildFreightBenchmark } from "../src/freight.js";

test("returns NO_BENCHMARK without evidence", () => {
  const r = buildFreightBenchmark({ distanceKm: 1000, units: 2 });
  assert.equal(r.status, "NO_BENCHMARK");
  assert.equal(r.expectedPerUnit, null);
});

test("builds quote-derived freight benchmark", () => {
  const r = buildFreightBenchmark({
    distanceKm: 1000,
    units: 2,
    commercialBufferPct: 5,
    tollsPerUnit: 100,
    borderFeesPerUnit: 50,
    quoteSamples: [
      { value: 2000, sourceType: "QUOTE", date: new Date().toISOString() },
      { value: 2200, sourceType: "QUOTE", date: new Date().toISOString() }
    ]
  });

  assert.equal(r.status, "BENCHMARK_READY");
  assert.equal(r.quoteCount, 2);
  assert.ok(r.expectedPerUnit > 2250);
  assert.ok(r.expectedTotal > r.expectedPerUnit);
  assert.ok(r.highPerUnit >= r.lowPerUnit);
});

test("uses per-km benchmark only when explicitly supplied", () => {
  const r = buildFreightBenchmark({
    distanceKm: 500,
    units: 1,
    perKmBenchmarks: [
      { ratePerKm: 1.5, sourceType: "MARKET_AVG", date: new Date().toISOString() }
    ]
  });

  assert.equal(r.status, "BENCHMARK_READY");
  assert.equal(r.perKmBenchmarkCount, 1);
  assert.ok(Math.abs(r.components.benchmarkBasePerUnit - 750) < 0.0001);
});


test("backhaul economics never invents a benefit without return-load evidence", async () => {
  const { calculateBackhaulEconomics } = await import("../src/backhaul.js");
  const r = calculateBackhaulEconomics({
    outboundFreightCost: 4000
  });
  assert.equal(r.status, "NO_BACKHAUL_EVIDENCE");
  assert.equal(r.expectedBenefit, 0);
  assert.equal(r.effectiveOutboundCost, 4000);
});

test("confirmed backhaul reduces effective freight cost by verified net benefit", async () => {
  const { calculateBackhaulEconomics, backhaulAdjustmentForLandedCost, BackhaulEvidence } = await import("../src/backhaul.js");
  const r = calculateBackhaulEconomics({
    outboundFreightCost: 4000,
    returnLoadRevenue: 2200,
    returnLoadExtraCost: 400,
    probabilityPct: 100,
    evidence: BackhaulEvidence.CONFIRMED_LOAD
  });
  assert.equal(r.expectedBenefit, 1800);
  assert.equal(r.effectiveOutboundCost, 2200);
  assert.equal(r.confidence, "HIGH");
  assert.equal(backhaulAdjustmentForLandedCost(r), 1800);
});

test("market backhaul signal is informational unless confirmed", async () => {
  const { calculateBackhaulEconomics, backhaulAdjustmentForLandedCost, BackhaulEvidence } = await import("../src/backhaul.js");
  const r = calculateBackhaulEconomics({
    outboundFreightCost: 4000,
    returnLoadRevenue: 2000,
    returnLoadExtraCost: 300,
    probabilityPct: 60,
    evidence: BackhaulEvidence.MARKET_SIGNAL
  });
  assert.equal(r.expectedRevenue, 1200);
  assert.equal(r.expectedBenefit, 900);
  assert.equal(backhaulAdjustmentForLandedCost(r), 0);
  assert.equal(backhaulAdjustmentForLandedCost(r,{confirmedOnly:false}), 900);
});


test("backhaul provider registry exposes authenticated road marketplaces", async () => {
  const { buildBackhaulProviderPlan } = await import("../../providers/src/backhaul.js");
  const r = buildBackhaulProviderPlan({ transportMode: "ROAD" });
  assert.equal(r.status, "PROVIDERS_AVAILABLE");
  assert.equal(r.autoApply, false);
  assert.ok(r.providers.some(x => x.id === "trans-eu"));
  assert.ok(r.providers.some(x => x.id === "teleroute"));
  assert.ok(r.providers.every(x => x.requiresCredentials === true));
});

test("backhaul provider registry falls back safely for unsupported modes", async () => {
  const { buildBackhaulProviderPlan } = await import("../../providers/src/backhaul.js");
  const r = buildBackhaulProviderPlan({ transportMode: "SEA" });
  assert.equal(r.status, "MANUAL_ONLY");
  assert.equal(r.providers.length, 0);
  assert.equal(r.autoApply, false);
});
