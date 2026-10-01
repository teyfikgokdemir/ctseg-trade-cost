export const SourceType = Object.freeze({
  LIVE: 'LIVE',
  OFFICIAL: 'OFFICIAL',
  MARKET_AVG: 'MARKET_AVG',
  QUOTE: 'QUOTE',
  ESTIMATE: 'ESTIMATE',
  MANUAL: 'MANUAL'
});

const SOURCE_WEIGHTS = {
  LIVE: 1.0,
  OFFICIAL: 0.98,
  QUOTE: 0.92,
  MARKET_AVG: 0.82,
  MANUAL: 0.75,
  ESTIMATE: 0.6
};

function assertPositive(value, field) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} must be a non-negative number`);
}

export function normalizeQuantity({ quantity, unit, densityKgPerL }) {
  assertPositive(quantity, 'quantity');
  if (unit === 'kg') return { kg: quantity, litres: densityKgPerL ? quantity / densityKgPerL : null };
  if (unit === 'mt') return { kg: quantity * 1000, litres: densityKgPerL ? (quantity * 1000) / densityKgPerL : null };
  if (unit === 'litre') {
    if (!densityKgPerL) throw new Error('densityKgPerL is required for litre quantities');
    return { kg: quantity * densityKgPerL, litres: quantity };
  }
  if (unit === 'unit') return { kg: null, litres: null, units: quantity };
  throw new Error(`Unsupported quantity unit: ${unit}`);
}

export function priceToTotal({ price, priceUnit, qty }) {
  assertPositive(price, 'price');
  if (priceUnit === 'usd/litre') {
    if (!qty.litres) throw new Error('Litres required for usd/litre pricing');
    return price * qty.litres;
  }
  if (priceUnit === 'usd/kg') return price * qty.kg;
  if (priceUnit === 'usd/mt') return price * (qty.kg / 1000);
  if (priceUnit === 'usd/unit') return price * qty.units;
  throw new Error(`Unsupported price unit: ${priceUnit}`);
}

export function weightedTrimmedAverage(samples, { trimRatio = 0.1, halfLifeDays = 30 } = {}) {
  const valid = samples
    .filter(x => Number.isFinite(x.value) && x.value >= 0)
    .sort((a, b) => a.value - b.value);
  if (!valid.length) return null;
  const trim = Math.floor(valid.length * trimRatio);
  const trimmed = valid.slice(trim, valid.length - trim || undefined);
  const now = Date.now();
  let numerator = 0;
  let denominator = 0;
  for (const s of trimmed) {
    const ageDays = Math.max(0, (now - new Date(s.date).getTime()) / 86400000);
    const recency = Math.pow(0.5, ageDays / halfLifeDays);
    const quality = SOURCE_WEIGHTS[s.sourceType] ?? 0.5;
    const w = recency * quality;
    numerator += s.value * w;
    denominator += w;
  }
  return denominator ? numerator / denominator : null;
}

function costRange(cost) {
  const spread = cost.uncertaintyPct ?? ({
    LIVE: 0.02,
    OFFICIAL: 0.005,
    QUOTE: 0.04,
    MARKET_AVG: 0.10,
    MANUAL: 0.08,
    ESTIMATE: 0.18
  }[cost.sourceType] ?? 0.12);
  return { low: cost.amount * (1 - spread), high: cost.amount * (1 + spread) };
}

export function calculateLandedCost(input) {
  const qty = normalizeQuantity(input.product);
  const goodsTotal = priceToTotal({ price: input.purchase.price, priceUnit: input.purchase.priceUnit, qty });
  const goodsCost = {
    code: 'GOODS', label: 'Purchase value', amount: goodsTotal,
    sourceType: input.purchase.sourceType ?? SourceType.QUOTE,
    updatedAt: input.purchase.updatedAt ?? new Date().toISOString(), uncertaintyPct: input.purchase.uncertaintyPct ?? 0
  };

  const rawCosts = [...(input.costs ?? [])];
  const taxLines = [...(input.taxes ?? [])];

  const tariffDecision = input.tariff?.normalized?.appliedRateDecision;
  const hasDutyLine = rawCosts.some(c => c.code === 'DUTY') || taxLines.some(c => c.code === 'DUTY');
  if (!hasDutyLine && Number.isFinite(Number(tariffDecision?.rate))) {
    rawCosts.push({
      code: 'DUTY',
      label: 'Import duty',
      calc: 'pct_customs_base',
      rate: Number(tariffDecision.rate),
      baseCodes: ['GOODS', 'FREIGHT_INTL', 'INSURANCE'],
      sourceType: SourceType.OFFICIAL,
      sourceName: input.tariff.sourceName ?? 'World Trade Organization',
      sourceYear: input.tariff.normalized?.resolvedYear ?? null,
      confidence: input.tariff.normalized?.confidence ?? null,
      tariffBasis: tariffDecision.basis ?? 'MFN',
      metadata: {
        hsCode: input.tariff.classification?.hs ?? null,
        reporter: input.tariff.route?.reporter ?? null,
        partner: input.tariff.route?.partner ?? null,
        preferentialCandidate: input.tariff.normalized?.preferentialCandidate ?? null
      }
    });
  }

  rawCosts.push(...taxLines);

  const resolved = new Map([[goodsCost.code, goodsCost]]);
  const costs = [goodsCost];

  for (const cost of rawCosts) {
    let amount = cost.amount;

    if (cost.calc === 'pct_goods') {
      amount = goodsTotal * (cost.rate / 100);
    }

    if (cost.calc === 'pct_customs_base' || cost.calc === 'pct_codes') {
      const baseCodes = cost.baseCodes ?? ['GOODS', 'FREIGHT_INTL', 'INSURANCE'];
      const base = baseCodes.reduce((sum, code) => {
        const item = resolved.get(code);
        return sum + (item?.amount ?? 0);
      }, 0);
      amount = base * (cost.rate / 100);
    }

    assertPositive(amount, cost.code);
    const resolvedCost = { ...cost, amount };
    costs.push(resolvedCost);
    resolved.set(resolvedCost.code, resolvedCost);
  }

  const landedCosts = costs.filter(c => c.affectsLandedCost !== false);
  const informationalCosts = costs.filter(c => c.affectsLandedCost === false);

  const total = landedCosts.reduce((s, c) => s + c.amount, 0);
  const low = landedCosts.reduce((s, c) => s + costRange(c).low, 0);
  const high = landedCosts.reduce((s, c) => s + costRange(c).high, 0);
  const weightedConfidence = total
    ? landedCosts.reduce((s, c) => s + c.amount * (SOURCE_WEIGHTS[c.sourceType] ?? 0.5), 0) / total
    : 0;

  return {
    currency: input.currency ?? 'USD',
    total,
    range: { low, high },
    confidencePct: Math.round(weightedConfidence * 100),
    perKg: qty.kg ? total / qty.kg : null,
    perMt: qty.kg ? total / (qty.kg / 1000) : null,
    perLitre: qty.litres ? total / qty.litres : null,
    quantity: qty,
    costs: costs.map(c => ({
      ...c,
      ...costRange(c),
      confidenceWeight: SOURCE_WEIGHTS[c.sourceType] ?? 0.5
    })),
    informationalCosts: informationalCosts.map(c => ({
      ...c,
      ...costRange(c),
      confidenceWeight: SOURCE_WEIGHTS[c.sourceType] ?? 0.5
    }))
  };
}
