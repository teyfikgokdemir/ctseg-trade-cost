import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLandedCost, normalizeQuantity, weightedTrimmedAverage, SourceType } from '../src/engine.js';

test('converts metric tons to litres using density', () => {
  const q = normalizeQuantity({ quantity: 100, unit: 'mt', densityKgPerL: 0.92 });
  assert.equal(q.kg, 100000);
  assert.ok(Math.abs(q.litres - 108695.65217) < 0.001);
});

test('calculates landed cost with per-unit outputs', () => {
  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt', densityKgPerL: 1 },
    purchase: { price: 1, priceUnit: 'usd/kg', sourceType: SourceType.QUOTE },
    costs: [{ code: 'FREIGHT_INTL', label: 'Freight', amount: 100, sourceType: SourceType.MARKET_AVG }]
  });
  assert.equal(r.total, 1100);
  assert.equal(r.perKg, 1.1);
  assert.equal(r.perMt, 1100);
});

test('weighted market average returns a sensible value', () => {
  const now = new Date();
  const samples = [100, 102, 103, 105, 250].map((value, i) => ({ value, date: new Date(now - i * 86400000).toISOString(), sourceType: SourceType.QUOTE }));
  const avg = weightedTrimmedAverage(samples, { trimRatio: 0.2 });
  assert.ok(avg > 100 && avg < 110);
});
