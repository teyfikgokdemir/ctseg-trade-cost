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
