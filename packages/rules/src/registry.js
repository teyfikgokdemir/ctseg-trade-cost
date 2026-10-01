export const CountryRulePackStatus = Object.freeze({
  CONFIGURED: "CONFIGURED",
  MANUAL_REQUIRED: "MANUAL_REQUIRED"
});

const CONFIGURED_RULE_PACKS = Object.freeze({
  TR: {
    country: "TR",
    name: "Türkiye",
    status: CountryRulePackStatus.CONFIGURED,
    taxModel: "IMPORT_VAT",
    availableModes: ["NORMAL_PURCHASE", "EXPORT_REGISTERED", "IMPORT_VAT"],
    ratePolicy: "PRODUCT_RATE_MUST_BE_VERIFIED",
    automaticRate: false,
    sourceName: "Türkiye country tax rule pack",
    notes: [
      "Import VAT calculation base is modeled separately from customs duty.",
      "Product-specific VAT rate, exemptions, recoverability and transaction treatment must still be verified."
    ]
  }
});

export function getCountryRuleProfile(country) {
  const code = String(country || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new Error("Country must be an ISO 3166-1 alpha-2 code");
  }

  const configured = CONFIGURED_RULE_PACKS[code];
  if (configured) return structuredClone(configured);

  return {
    country: code,
    name: null,
    status: CountryRulePackStatus.MANUAL_REQUIRED,
    taxModel: "GENERIC_IMPORT_TAX",
    availableModes: [],
    ratePolicy: "VERIFIED_RATE_ONLY",
    automaticRate: false,
    sourceName: null,
    notes: [
      "No automated country-specific tax rule pack is configured.",
      "Use only a verified destination-country import VAT/local tax rate and verify the applicable tax base before final quoting."
    ]
  };
}

export function listConfiguredCountryRulePacks() {
  return Object.values(CONFIGURED_RULE_PACKS).map(profile => structuredClone(profile));
}
