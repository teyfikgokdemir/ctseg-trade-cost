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


test('applies normalized official tariff to resolved customs base', () => {
  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    costs: [
      { code: 'FREIGHT_INTL', label: 'Freight', amount: 100, sourceType: SourceType.QUOTE },
      { code: 'INSURANCE', label: 'Insurance', calc: 'pct_goods', rate: 1, sourceType: SourceType.QUOTE }
    ],
    tariff: {
      sourceName: 'World Trade Organization',
      classification: { hs: '292250' },
      route: { reporter: '792', partner: '156' },
      normalized: {
        resolvedYear: 2023,
        confidence: 'MEDIUM',
        preferentialCandidate: { rate: 0, eligibilityStatus: 'NOT_CONFIRMED' },
        appliedRateDecision: { rate: 6.5, basis: 'MFN' }
      }
    }
  });

  const duty = r.costs.find(x => x.code === 'DUTY');
  assert.equal(duty.amount, 72.15);
  assert.equal(duty.rate, 6.5);
  assert.equal(duty.sourceType, SourceType.OFFICIAL);
  assert.equal(duty.sourceYear, 2023);
  assert.equal(duty.tariffBasis, 'MFN');
  assert.equal(r.total, 1182.15);
});

test('does not duplicate an explicitly supplied duty line', () => {
  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    costs: [
      { code: 'DUTY', label: 'Manual duty', calc: 'pct_goods', rate: 5, sourceType: SourceType.MANUAL }
    ],
    tariff: {
      normalized: { appliedRateDecision: { rate: 6.5, basis: 'MFN' } }
    }
  });

  assert.equal(r.costs.filter(x => x.code === 'DUTY').length, 1);
  assert.equal(r.costs.find(x => x.code === 'DUTY').amount, 50);
});
