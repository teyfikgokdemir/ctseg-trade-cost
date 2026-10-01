import { SourceType, weightedTrimmedAverage } from "./engine.js";

const QUALITY = {
  LIVE: 1.0,
  QUOTE: 0.92,
  MARKET_AVG: 0.82,
  OFFICIAL: 0.80,
  MANUAL: 0.75,
  ESTIMATE: 0.60
};

function finiteNonNegative(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function normalizeQuote(quote) {
  const value = finiteNonNegative(quote?.value ?? quote?.amount);
  if (value === null) return null;
  return {
    value,
    date: quote.date || quote.quotedAt || quote.updatedAt || new Date().toISOString(),
    sourceType: quote.sourceType || SourceType.QUOTE,
    sourceName: quote.sourceName || quote.provider || null,
    validUntil: quote.validUntil || null,
    currency: quote.currency || "USD"
  };
}

function sampleRange(samples, center) {
  if (!samples.length || !Number.isFinite(center)) return null;
  const values = samples.map(x => x.value).filter(Number.isFinite).sort((a,b)=>a-b);
  const min = values[0];
  const max = values[values.length - 1];
  if (values.length === 1) {
    return { low: center * 0.95, high: center * 1.05, observedMin: min, observedMax: max };
  }
  return {
    low: Math.min(center, min),
    high: Math.max(center, max),
    observedMin: min,
    observedMax: max
  };
}

export function buildFreightBenchmark(input = {}) {
  const distanceKm = finiteNonNegative(input.distanceKm);
  const units = Math.max(1, Number(input.units || 1));
  const bufferPct = Math.max(0, Number(input.commercialBufferPct || 0));
  const tollsPerUnit = finiteNonNegative(input.tollsPerUnit) ?? 0;
  const borderFeesPerUnit = finiteNonNegative(input.borderFeesPerUnit) ?? 0;

  const quoteSamples = (input.quoteSamples || [])
    .map(normalizeQuote)
    .filter(Boolean);

  const marketSamples = (input.marketSamples || [])
    .map(normalizeQuote)
    .filter(Boolean);

  const perKmBenchmarks = (input.perKmBenchmarks || [])
    .map(item => {
      const rate = finiteNonNegative(item?.ratePerKm);
      if (rate === null || distanceKm === null) return null;
      return {
        value: rate * distanceKm,
        date: item.date || item.updatedAt || new Date().toISOString(),
        sourceType: item.sourceType || SourceType.MARKET_AVG,
        sourceName: item.sourceName || null,
        currency: item.currency || "USD",
        metadata: { ratePerKm: rate, distanceKm }
      };
    })
    .filter(Boolean);

  const allSamples = [...quoteSamples, ...marketSamples, ...perKmBenchmarks];

  if (!allSamples.length) {
    return {
      status: "NO_BENCHMARK",
      distanceKm,
      units,
      currency: input.currency || "USD",
      expectedPerUnit: null,
      expectedTotal: null,
      lowPerUnit: null,
      highPerUnit: null,
      confidence: "LOW",
      confidencePct: 0,
      sourceMix: [],
      notes: [
        "No quote, market sample or per-km benchmark is available. No freight price was invented."
      ]
    };
  }

  const expectedBase = weightedTrimmedAverage(allSamples, {
    trimRatio: allSamples.length >= 5 ? 0.1 : 0,
    halfLifeDays: 30
  });

  const extrasPerUnit = tollsPerUnit + borderFeesPerUnit;
  const expectedPerUnitBeforeBuffer = expectedBase + extrasPerUnit;
  const expectedPerUnit = expectedPerUnitBeforeBuffer * (1 + bufferPct / 100);
  const range = sampleRange(allSamples, expectedBase) || { low: expectedBase, high: expectedBase };
  const lowPerUnit = (range.low + extrasPerUnit) * (1 + bufferPct / 100);
  const highPerUnit = (range.high + extrasPerUnit) * (1 + bufferPct / 100);

  const weightedQuality = allSamples.reduce((sum, sample) => {
    return sum + (QUALITY[sample.sourceType] ?? 0.5);
  }, 0) / allSamples.length;

  const freshnessBonus = Math.min(0.08, allSamples.length * 0.015);
  const diversityBonus = new Set(allSamples.map(x => x.sourceType)).size >= 2 ? 0.05 : 0;
  const confidencePct = Math.max(0, Math.min(100, Math.round((weightedQuality + freshnessBonus + diversityBonus) * 100)));

  let confidence = "LOW";
  if (confidencePct >= 90 && quoteSamples.length >= 2) confidence = "HIGH";
  else if (confidencePct >= 75) confidence = "MEDIUM";

  const sourceMix = Object.entries(
    allSamples.reduce((acc, s) => {
      const key = s.sourceType || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([sourceType, count]) => ({ sourceType, count }));

  return {
    status: "BENCHMARK_READY",
    distanceKm,
    units,
    currency: input.currency || allSamples[0]?.currency || "USD",
    expectedPerUnit,
    expectedTotal: expectedPerUnit * units,
    lowPerUnit,
    highPerUnit,
    lowTotal: lowPerUnit * units,
    highTotal: highPerUnit * units,
    components: {
      benchmarkBasePerUnit: expectedBase,
      tollsPerUnit,
      borderFeesPerUnit,
      commercialBufferPct: bufferPct
    },
    confidence,
    confidencePct,
    sourceMix,
    sampleCount: allSamples.length,
    quoteCount: quoteSamples.length,
    marketSampleCount: marketSamples.length,
    perKmBenchmarkCount: perKmBenchmarks.length,
    notes: [
      quoteSamples.length ? "Forwarder/carrier quotes contributed to the benchmark." : null,
      marketSamples.length ? "Market benchmark samples contributed to the benchmark." : null,
      perKmBenchmarks.length ? "Distance-based benchmark samples contributed to the benchmark." : null,
      bufferPct ? "Commercial buffer was applied after benchmark and route extras." : null
    ].filter(Boolean)
  };
}
