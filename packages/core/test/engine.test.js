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


test('trade remedies require verified rate, route, HS and legal/source reference', async () => {
  const {
    createVerifiedTradeRemedy,
    TradeRemedyType,
    TradeRemedyRateBasis
  } = await import("../src/trade-remedies.js");

  assert.throws(() => createVerifiedTradeRemedy({
    type: TradeRemedyType.ANTI_DUMPING,
    originCountry: "CN",
    importCountry: "US",
    hsCode: "730890",
    rateBasis: TradeRemedyRateBasis.CUSTOMS_VALUE_PERCENT,
    rate: 25
  }), /reference is required/);

  assert.throws(() => createVerifiedTradeRemedy({
    type: TradeRemedyType.COUNTERVAILING,
    originCountry: "CN",
    importCountry: "US",
    hsCode: "ABC",
    rate: 5,
    reference: "official case"
  }), /hsCode must be 6-10 digits/);
});

test('trade remedy engine resolves customs-value, goods-value, per-MT and fixed bases', async () => {
  const {
    createVerifiedTradeRemedy,
    resolveTradeRemedyAmount,
    TradeRemedyType,
    TradeRemedyRateBasis
  } = await import("../src/trade-remedies.js");

  const ad = createVerifiedTradeRemedy({
    type: TradeRemedyType.ANTI_DUMPING,
    originCountry: "CN",
    importCountry: "US",
    hsCode: "730890",
    rateBasis: TradeRemedyRateBasis.CUSTOMS_VALUE_PERCENT,
    rate: 25,
    reference: "verified official case"
  });
  assert.equal(resolveTradeRemedyAmount(ad,{customsValue:1000,goodsValue:900,quantityMt:2}),250);

  const safeguard = createVerifiedTradeRemedy({
    type: TradeRemedyType.SAFEGUARD,
    originCountry: "TR",
    importCountry: "MA",
    hsCode: "720839",
    rateBasis: TradeRemedyRateBasis.PER_MT,
    rate: 50,
    reference: "verified official measure"
  });
  assert.equal(resolveTradeRemedyAmount(safeguard,{customsValue:1000,goodsValue:900,quantityMt:2}),100);

  const fixed = createVerifiedTradeRemedy({
    type: TradeRemedyType.OTHER_TRADE_REMEDY,
    originCountry: "BR",
    importCountry: "JP",
    hsCode: "080212",
    rateBasis: TradeRemedyRateBasis.FIXED,
    rate: 75,
    reference: "verified official measure"
  });
  assert.equal(resolveTradeRemedyAmount(fixed,{customsValue:1000,goodsValue:900,quantityMt:2}),75);
});

test('unresolved trade remedy candidate never invents a zero rate', async () => {
  const { createUnresolvedTradeRemedyCandidate, TradeRemedyType } = await import("../src/trade-remedies.js");
  const r = createUnresolvedTradeRemedyCandidate({
    type: TradeRemedyType.RETALIATORY_TARIFF,
    originCountry: "CN",
    importCountry: "US",
    hsCode: "850760"
  });
  assert.equal(r.rate, null);
  assert.equal(r.verified, false);
  assert.equal(r.requiresVerification, true);
});


test('trade remedy provider registry routes EU destinations to TARIC', async () => {
  const { buildTradeRemedyLookupPlan } = await import("../../providers/src/trade-remedies.js");
  const plan = buildTradeRemedyLookupPlan({
    originCountry: "CN",
    importCountry: "DE",
    hsCode: "730890",
    type: "ANTI_DUMPING"
  });

  assert.equal(plan.status, "OFFICIAL_PROVIDER_AVAILABLE");
  assert.equal(plan.autoApply, false);
  assert.ok(plan.providers.some(x => x.id === "eu-taric"));
});

test('trade remedy provider registry routes US AD/CVD to official US sources', async () => {
  const { buildTradeRemedyLookupPlan } = await import("../../providers/src/trade-remedies.js");
  const plan = buildTradeRemedyLookupPlan({
    originCountry: "CN",
    importCountry: "US",
    hsCode: "730890",
    type: "ANTI_DUMPING"
  });

  assert.equal(plan.status, "OFFICIAL_PROVIDER_AVAILABLE");
  assert.ok(plan.providers.some(x => x.id === "us-ita-adcvd"));
  assert.ok(plan.providers.some(x => x.id === "us-cbp-adcvd"));
});

test('trade remedy provider registry falls back safely when no official connector is configured', async () => {
  const { buildTradeRemedyLookupPlan } = await import("../../providers/src/trade-remedies.js");
  const plan = buildTradeRemedyLookupPlan({
    originCountry: "BR",
    importCountry: "MA",
    hsCode: "080212",
    type: "ANTI_DUMPING"
  });

  assert.equal(plan.status, "MANUAL_VERIFICATION_REQUIRED");
  assert.equal(plan.providers.length, 0);
  assert.equal(plan.autoApply, false);
});


test('EU TEDB VAT provider parses standard and product-specific rates safely', async () => {
  const { fetchEuVatRates, buildTedbVatRequest } = await import("../../providers/src/eu-tedb.js");

  const xml = `<?xml version="1.0"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <vatRateResults>
        <type>STANDARD</type>
        <rate><type>DEFAULT</type><value>19</value></rate>
      </vatRateResults>
      <vatRateResults>
        <type>REDUCED</type>
        <rate><type>DEFAULT</type><value>7</value></rate>
        <cnCodes><value>151219</value></cnCodes>
      </vatRateResults>
    </soap:Body>
  </soap:Envelope>`;

  const mockFetch = async () => new Response(xml,{status:200,headers:{"content-type":"text/xml"}});
  const r = await fetchEuVatRates({
    country:"DE",
    hsCode:"151219",
    date:"2026-10-02",
    fetchImpl:mockFetch
  });

  assert.equal(r.standardRate,19);
  assert.equal(r.productCandidates[0]?.rate,7);
  assert.deepEqual(r.productCandidates[0]?.cnCodes,["151219"]);
  assert.equal(r.productSpecificResolved,true);

  const request = buildTedbVatRequest({country:"DE",hsCode:"151219",date:"2026-10-02"});
  assert.match(request,/151219/);
  assert.match(request,/2026-10-02/);
});

test('EU TEDB VAT provider supports EU27 only', async () => {
  const { buildTedbVatRequest } = await import("../../providers/src/eu-tedb.js");
  assert.throws(() => buildTedbVatRequest({country:"US"}),/EU27/);
});
