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
    customsValuation: {
      value: 1110,
      status: 'VERIFIED',
      requiresVerification: false
    },
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


test('keeps export-registered VAT informational and out of landed cost', async () => {
  const { createTrVatLine, TrVatMode } = await import("../../rules/src/tr.js");
  const tax = createTrVatLine({ mode: TrVatMode.EXPORT_REGISTERED, verifiedRate: 20 });

  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    taxes: [tax]
  });

  assert.equal(r.total, 1000);
  assert.equal(r.informationalCosts.length, 1);
  assert.equal(r.informationalCosts[0].code, 'TR_EXPORT_REGISTERED_VAT');
  assert.equal(r.informationalCosts[0].amount, 200);
  assert.equal(r.informationalCosts[0].affectsLandedCost, false);
});

test('calculates Türkiye import VAT on customs value plus duty', async () => {
  const { createTrVatLine, TrVatMode } = await import("../../rules/src/tr.js");
  const tax = createTrVatLine({ mode: TrVatMode.IMPORT_VAT, verifiedRate: 20 });

  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    costs: [
      { code: 'FREIGHT_INTL', label: 'Freight', amount: 100, sourceType: SourceType.QUOTE },
      { code: 'INSURANCE', label: 'Insurance', amount: 10, sourceType: SourceType.QUOTE }
    ],
    customsValuation: {
      value: 1110,
      status: 'VERIFIED',
      requiresVerification: false
    },
    tariff: {
      sourceName: 'World Trade Organization',
      classification: { hs: '292250' },
      route: { reporter: '792', partner: '156' },
      normalized: {
        resolvedYear: 2023,
        confidence: 'MEDIUM',
        appliedRateDecision: { rate: 6.5, basis: 'MFN' }
      }
    },
    taxes: [tax]
  });

  const duty = r.costs.find(x => x.code === 'DUTY');
  const vat = r.costs.find(x => x.code === 'TR_IMPORT_VAT');

  assert.equal(duty.amount, 72.15);
  assert.ok(Math.abs(vat.amount - 236.43) < 0.000001);
  assert.ok(Math.abs(r.total - 1418.58) < 0.000001);
});


test('country tax rule registry provides country-specific or global-generic capability', async () => {
  const { getCountryRuleProfile, CountryRulePackStatus, getGlobalTradeTaxCapabilities } = await import("../../rules/src/registry.js");

  const tr = getCountryRuleProfile("TR");
  assert.equal(tr.status, CountryRulePackStatus.COUNTRY_SPECIFIC);
  assert.equal(tr.taxModel, "IMPORT_VAT");
  assert.equal(tr.automaticRate, false);

  const af = getCountryRuleProfile("AF");
  assert.equal(af.status, CountryRulePackStatus.GLOBAL_GENERIC);
  assert.equal(af.taxModel, "GENERIC_MULTI_TAX");
  assert.equal(af.ratePolicy, "VERIFIED_RATE_ONLY");
  assert.equal(af.automaticRate, false);

  const global = getGlobalTradeTaxCapabilities();
  assert.equal(global.scope, "ANY_ORIGIN_TO_ANY_DESTINATION");
  assert.equal(global.automaticUnknownRate, false);
});

test('country tax rule registry rejects non ISO2 codes', async () => {
  const { getCountryRuleProfile } = await import("../../rules/src/registry.js");
  assert.throws(() => getCountryRuleProfile("792"), /ISO 3166-1 alpha-2/);
});


test('global trade chain separates origin, export, transit and import countries', async () => {
  const { normalizeTradeChain, tariffRouteFromTradeChain, freightRouteFromTradeChain } = await import("../src/trade-route.js");

  const chain = normalizeTradeChain({
    countryOfOrigin: "CN",
    exportCountry: "TR",
    transitCountries: ["GE", "AZ", "GE"],
    importCountry: "IR",
    transportMode: "ROAD",
    departurePoint: "Mersin",
    destinationPoint: "Tabriz"
  });

  assert.equal(chain.countryOfOrigin, "CN");
  assert.equal(chain.exportCountry, "TR");
  assert.deepEqual(chain.transitCountries, ["GE", "AZ"]);
  assert.equal(chain.importCountry, "IR");

  assert.deepEqual(tariffRouteFromTradeChain(chain), {
    partnerCountry: "CN",
    reporterCountry: "IR"
  });

  const freight = freightRouteFromTradeChain(chain);
  assert.equal(freight.originCountry, "TR");
  assert.equal(freight.destinationCountry, "IR");
  assert.equal(freight.transportMode, "ROAD");
});

test('global trade chain accepts any valid ISO2 country pair and rejects invalid modes', async () => {
  const { normalizeTradeChain } = await import("../src/trade-route.js");
  const route = normalizeTradeChain({
    countryOfOrigin: "BR",
    exportCountry: "BR",
    importCountry: "JP",
    transportMode: "SEA"
  });
  assert.equal(route.scope, "GLOBAL");
  assert.throws(() => normalizeTradeChain({
    countryOfOrigin: "BR",
    exportCountry: "BR",
    importCountry: "JP",
    transportMode: "SPACE"
  }), /Unsupported transportMode/);
});


test('global multi-tax model requires verified rates and explicit bases', async () => {
  const { createVerifiedGlobalTaxLine, GlobalTaxType } = await import("../src/global-tax.js");

  assert.throws(() => createVerifiedGlobalTaxLine({
    country: "DE",
    type: GlobalTaxType.VAT_GST,
    rate: null,
    baseCodes: ["GOODS"]
  }), /verified non-negative tax rate/i);

  assert.throws(() => createVerifiedGlobalTaxLine({
    country: "DE",
    type: GlobalTaxType.VAT_GST,
    rate: 19,
    baseCodes: []
  }), /baseCodes are required/i);
});

test('global multi-tax line integrates with landed-cost engine', async () => {
  const { createVerifiedGlobalTaxLine, GlobalTaxType } = await import("../src/global-tax.js");
  const tax = createVerifiedGlobalTaxLine({
    country: "DE",
    type: GlobalTaxType.VAT_GST,
    code: "DE_IMPORT_VAT",
    label: "Germany import VAT",
    rate: 19,
    baseCodes: ["GOODS", "DUTY"],
    sourceType: SourceType.MANUAL
  });

  const r = calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    costs: [
      { code: 'DUTY', label: 'Duty', amount: 100, sourceType: SourceType.MANUAL }
    ],
    taxes: [tax]
  });

  const vat = r.costs.find(x => x.code === "DE_IMPORT_VAT");
  assert.ok(vat);
  assert.equal(vat.amount, 209);
  assert.equal(r.total, 1309);
});

test('unresolved global tax requirement never invents a zero rate', async () => {
  const { createUnresolvedGlobalTaxRequirement, GlobalTaxType } = await import("../src/global-tax.js");
  const req = createUnresolvedGlobalTaxRequirement({
    country: "JP",
    type: GlobalTaxType.VAT_GST
  });
  assert.equal(req.rate, null);
  assert.equal(req.requiresRateVerification, true);
  assert.equal(req.rateStatus, "UNRESOLVED");
});


test('Incoterm scope detects likely duplicate buyer-added costs', async () => {
  const { findPotentialIncotermDoubleCounts, isIncotermModeCompatible } = await import("../src/incoterms.js");

  const duplicates = findPotentialIncotermDoubleCounts({
    incoterm: "CIF",
    costs: [
      { code: "FREIGHT_INTL", label: "Freight", amount: 1200 },
      { code: "INSURANCE", label: "Insurance", amount: 100 },
      { code: "IMPORT_DUTY", label: "Duty", amount: 300 }
    ]
  });

  assert.deepEqual(duplicates.map(x => x.code), ["FREIGHT_INTL", "INSURANCE"]);
  assert.equal(isIncotermModeCompatible("CIF", "SEA"), true);
  assert.equal(isIncotermModeCompatible("CIF", "ROAD"), false);
});

test('Incoterm customs valuation remains country-rule dependent', async () => {
  const { getIncotermCostScope } = await import("../src/incoterms.js");
  const scope = getIncotermCostScope("DDP");
  assert.equal(scope.customsValuationPolicy, "COUNTRY_RULE_REQUIRED");
  assert.ok(scope.sellerIncludedCostCodes.includes("IMPORT_DUTY"));
});


test('tariff duty refuses to calculate without verified customs valuation', () => {
  assert.throws(() => calculateLandedCost({
    product: { quantity: 1, unit: 'mt' },
    purchase: { price: 1000, priceUnit: 'usd/mt', sourceType: SourceType.QUOTE },
    tariff: {
      normalized: { appliedRateDecision: { rate: 5, basis: 'MFN' } }
    }
  }), /Verified customs valuation is required/);
});

test('global customs valuation calculates explicit additions and deductions', async () => {
  const {
    calculateCustomsValue,
    CustomsValuationStatus,
    CustomsAdjustmentType
  } = await import("../src/customs-valuation.js");

  const r = calculateCustomsValue({
    transactionValue: 1000,
    status: CustomsValuationStatus.VERIFIED,
    country: 'DE',
    adjustments: [
      { type: CustomsAdjustmentType.FREIGHT_TO_BORDER, amount: 100, verified: true },
      { type: CustomsAdjustmentType.INSURANCE_TO_BORDER, amount: 10, verified: true },
      { type: CustomsAdjustmentType.ASSISTS, amount: 50, verified: true },
      { type: CustomsAdjustmentType.POST_IMPORT_TRANSPORT, amount: 20, verified: true }
    ]
  });

  assert.equal(r.additions, 160);
  assert.equal(r.deductions, 20);
  assert.equal(r.value, 1140);
  assert.equal(r.requiresVerification, false);
  assert.equal(r.policy, 'COUNTRY_SPECIFIC_RULE_REQUIRED');
});

test('customs valuation stays unresolved when a non-zero adjustment is unverified', async () => {
  const {
    calculateCustomsValue,
    CustomsValuationStatus,
    CustomsAdjustmentType
  } = await import("../src/customs-valuation.js");

  const r = calculateCustomsValue({
    transactionValue: 1000,
    status: CustomsValuationStatus.VERIFIED,
    adjustments: [
      { type: CustomsAdjustmentType.ROYALTIES_LICENSE_FEES, amount: 25, verified: false }
    ]
  });

  assert.equal(r.value, 1025);
  assert.equal(r.requiresVerification, true);
  assert.deepEqual(r.unresolvedAdjustments, ['ROYALTIES_LICENSE_FEES']);
});


test('preferential tariff never applies from candidate evidence alone', async () => {
  const { resolvePreferentialTariff, PreferentialEligibility } = await import("../src/preferential-tariff.js");

  const r = resolvePreferentialTariff({
    mfnRate: 10,
    candidateRate: 2,
    eligibilityStatus: PreferentialEligibility.NOT_CONFIRMED
  });

  assert.equal(r.rate, 10);
  assert.equal(r.basis, "MFN");
  assert.equal(r.requiresVerification, false);
});

test('verified preferential tariff requires eligibility, rate and scheme reference', async () => {
  const { resolvePreferentialTariff, PreferentialEligibility } = await import("../src/preferential-tariff.js");

  const incomplete = resolvePreferentialTariff({
    mfnRate: 10,
    candidateRate: 2,
    eligibilityStatus: PreferentialEligibility.ELIGIBLE,
    verifiedPreferentialRate: 2
  });
  assert.equal(incomplete.rate, 10);
  assert.equal(incomplete.basis, "MFN");
  assert.equal(incomplete.requiresVerification, true);

  const verified = resolvePreferentialTariff({
    mfnRate: 10,
    candidateRate: 2,
    eligibilityStatus: PreferentialEligibility.ELIGIBLE,
    verifiedPreferentialRate: 2,
    schemeReference: "Verified FTA / origin evidence"
  });
  assert.equal(verified.rate, 2);
  assert.equal(verified.basis, "PREFERENTIAL_VERIFIED");
  assert.equal(verified.requiresVerification, false);
});
