export const CountryRulePackStatus = Object.freeze({
  COUNTRY_SPECIFIC: "COUNTRY_SPECIFIC",
  GLOBAL_GENERIC: "GLOBAL_GENERIC"
});

const COUNTRY_SPECIFIC_RULE_PACKS = Object.freeze({
  TR: {
    country: "TR",
    name: "Türkiye",
    status: CountryRulePackStatus.COUNTRY_SPECIFIC,
    capabilityLevel: "PARTIAL",
    taxModel: "IMPORT_VAT",
    availableModes: ["NORMAL_PURCHASE", "EXPORT_REGISTERED", "IMPORT_VAT"],
    supportedTaxTypes: ["VAT_GST"],
    ratePolicy: "PRODUCT_RATE_MUST_BE_VERIFIED",
    automaticRate: false,
    sourceName: "Türkiye country tax rule pack",
    notes: [
      "Import VAT calculation base is modeled separately from customs duty.",
      "Product-specific VAT rate, exemptions, recoverability and transaction treatment must still be verified."
    ]
  }
});

function genericProfile(code) {
  return {
    country: code,
    name: null,
    status: CountryRulePackStatus.GLOBAL_GENERIC,
    capabilityLevel: "GENERIC",
    taxModel: "GENERIC_MULTI_TAX",
    availableModes: ["IMPORT"],
    supportedTaxTypes: [
      "CUSTOMS_DUTY",
      "VAT_GST",
      "EXCISE",
      "SURCHARGE",
      "IMPORT_LEVY",
      "CUSTOMS_PROCESSING_FEE",
      "OTHER_IMPORT_TAX"
    ],
    ratePolicy: "VERIFIED_RATE_ONLY",
    automaticRate: false,
    sourceName: "Global generic trade tax engine",
    notes: [
      "The generic engine is available for every ISO country pair.",
      "Country-specific rates, tax bases, exemptions, trade remedies and preferential treatment must be supplied by a verified data provider or entered manually.",
      "Missing country-specific data never becomes a zero tax assumption."
    ]
  };
}

export function getCountryRuleProfile(country) {
  const code = String(country || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new Error("Country must be an ISO 3166-1 alpha-2 code");
  }

  const configured = COUNTRY_SPECIFIC_RULE_PACKS[code];
  if (configured) return structuredClone(configured);
  return genericProfile(code);
}

export function listConfiguredCountryRulePacks() {
  return Object.values(COUNTRY_SPECIFIC_RULE_PACKS).map(profile => structuredClone(profile));
}

export function getGlobalTradeTaxCapabilities() {
  return {
    scope: "ANY_ORIGIN_TO_ANY_DESTINATION",
    automaticUnknownRate: false,
    supportedTaxTypes: genericProfile("ZZ").supportedTaxTypes,
    countrySpecificPacks: listConfiguredCountryRulePacks().map(x => x.country)
  };
}
