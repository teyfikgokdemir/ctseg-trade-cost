import { SourceType } from "./engine.js";
import { TaxTreatment, createPercentageTaxLine } from "./tax.js";

export const GlobalTaxType = Object.freeze({
  VAT_GST: "VAT_GST",
  EXCISE: "EXCISE",
  SURCHARGE: "SURCHARGE",
  IMPORT_LEVY: "IMPORT_LEVY",
  CUSTOMS_PROCESSING_FEE: "CUSTOMS_PROCESSING_FEE",
  OTHER_IMPORT_TAX: "OTHER_IMPORT_TAX"
});

export const GlobalTaxRateStatus = Object.freeze({
  VERIFIED: "VERIFIED",
  UNRESOLVED: "UNRESOLVED"
});

export function createVerifiedGlobalTaxLine({
  country,
  type,
  code,
  label,
  rate,
  baseCodes,
  sourceType = SourceType.MANUAL,
  sourceName = null,
  sourceYear = null,
  affectsLandedCost = true,
  recoverability = "UNKNOWN",
  treatment = TaxTreatment.NORMAL,
  metadata = {}
} = {}) {
  const iso2 = String(country || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso2)) {
    throw new Error("country must be an ISO 3166-1 alpha-2 code");
  }

  if (!Object.values(GlobalTaxType).includes(type)) {
    throw new Error("Unsupported global tax type");
  }

  if (!Array.isArray(baseCodes) || !baseCodes.length) {
    throw new Error("baseCodes are required for a verified percentage tax line");
  }

  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate < 0) {
    throw new Error("A verified non-negative tax rate is required");
  }

  return createPercentageTaxLine({
    code: code || `${iso2}_${type}`,
    label: label || `${iso2} ${type}`,
    rate: numericRate,
    baseCodes,
    sourceType,
    sourceName,
    sourceYear,
    country: iso2,
    treatment,
    affectsLandedCost,
    recoverability,
    rateStatus: GlobalTaxRateStatus.VERIFIED,
    requiresRateVerification: false,
    metadata: {
      taxType: type,
      globalGeneric: true,
      ...metadata
    }
  });
}

export function createUnresolvedGlobalTaxRequirement({
  country,
  type,
  label = null,
  basePolicy = "VERIFY_COUNTRY_RULE",
  metadata = {}
} = {}) {
  const iso2 = String(country || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso2)) {
    throw new Error("country must be an ISO 3166-1 alpha-2 code");
  }

  if (!Object.values(GlobalTaxType).includes(type)) {
    throw new Error("Unsupported global tax type");
  }

  return {
    country: iso2,
    type,
    label: label || `${iso2} ${type}`,
    rate: null,
    rateStatus: GlobalTaxRateStatus.UNRESOLVED,
    requiresRateVerification: true,
    basePolicy,
    affectsLandedCost: null,
    metadata: {
      globalGeneric: true,
      ...metadata
    }
  };
}
