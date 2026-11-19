import test from "node:test";
import assert from "node:assert/strict";
import { estimateGeneralLandedCost, SimpleEstimateDefaults } from "../src/simple-estimate.js";

test("estimateGeneralLandedCost computes default SEA mode estimate and range", () => {
  const result = estimateGeneralLandedCost({
    goodsValue: 50000,
    quantityMt: 20,
    transportMode: "sea"
  });

  assert.equal(result.transportMode, "SEA");
  assert.equal(result.freightPerMt, SimpleEstimateDefaults.SEA.freightPerMt);
  assert.equal(result.freight, 1400);
  assert.equal(result.dutyRate, 5);
  assert.equal(result.importTaxRate, 10);
  assert.equal(result.estimate, true);
  assert.deepEqual(result.assumptions, {
    freightFallback: true,
    dutyFallback: true,
    taxFallback: true,
    insurancePct: 0.35,
    localCostPct: 1.25
  });
  assert.ok(result.range.low < result.total);
  assert.ok(result.range.high > result.total);
});

test("estimateGeneralLandedCost respects explicit freight, duty and tax overrides", () => {
  const result = estimateGeneralLandedCost({
    goodsValue: 10000,
    quantityMt: 10,
    transportMode: "ROAD",
    freightPerMt: 95,
    customsDutyRate: 3,
    importTaxRate: 20,
    insurancePct: 0.5,
    localCostPct: 1
  });

  assert.equal(result.freight, 950);
  assert.equal(result.insurance, 50);
  assert.equal(result.customsBase, 11000);
  assert.equal(result.duty, 330);
  assert.equal(result.importTax, 2266);
  assert.equal(result.localCosts, 109.5);
  assert.equal(result.total, 13705.5);
  assert.equal(result.assumptions.freightFallback, false);
  assert.equal(result.assumptions.dutyFallback, false);
  assert.equal(result.assumptions.taxFallback, false);
});

test("estimateGeneralLandedCost falls back to ROAD defaults for unknown mode and rejects invalid inputs", () => {
  const fallback = estimateGeneralLandedCost({
    goodsValue: 1000,
    quantityMt: 2,
    transportMode: "UNKNOWN"
  });
  assert.equal(fallback.freightPerMt, SimpleEstimateDefaults.ROAD.freightPerMt);

  assert.throws(() => estimateGeneralLandedCost({ goodsValue: -1, quantityMt: 1 }), /non-negative number/);
  assert.throws(() => estimateGeneralLandedCost({ goodsValue: 100, quantityMt: "NaN" }), /non-negative number/);
});
