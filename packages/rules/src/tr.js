import { SourceType } from "../../core/src/engine.js";
import { TaxTreatment, createPercentageTaxLine } from "../../core/src/tax.js";

export const TrVatMode = Object.freeze({
  NORMAL_PURCHASE: "NORMAL_PURCHASE",
  EXPORT_REGISTERED: "EXPORT_REGISTERED",
  IMPORT_VAT: "IMPORT_VAT"
});

export function resolveTrVatRate({ verifiedRate = null } = {}) {
  if (Number.isFinite(Number(verifiedRate))) {
    return {
      rate: Number(verifiedRate),
      rateStatus: "VERIFIED",
      requiresRateVerification: false,
      sourceName: "Verified product-specific Turkish VAT rate"
    };
  }

  return {
    rate: 20,
    rateStatus: "GENERAL_RATE_FALLBACK",
    requiresRateVerification: true,
    sourceName: "Türkiye general VAT rate fallback"
  };
}

export function createTrVatLine({
  mode,
  verifiedRate = null,
  sourceYear = 2026
} = {}) {
  const rateInfo = resolveTrVatRate({ verifiedRate });

  if (mode === TrVatMode.NORMAL_PURCHASE) {
    return createPercentageTaxLine({
      code: "TR_PURCHASE_VAT",
      label: "Türkiye purchase VAT",
      rate: rateInfo.rate,
      baseCodes: ["GOODS"],
      sourceType: SourceType.OFFICIAL,
      sourceName: rateInfo.sourceName,
      sourceYear,
      country: "TR",
      treatment: TaxTreatment.NORMAL,
      affectsLandedCost: true,
      recoverability: "CONTEXT_DEPENDENT",
      rateStatus: rateInfo.rateStatus,
      requiresRateVerification: rateInfo.requiresRateVerification,
      metadata: {
        mode,
        note: "Cash treatment depends on the buyer's VAT recovery position."
      }
    });
  }

  if (mode === TrVatMode.EXPORT_REGISTERED) {
    return createPercentageTaxLine({
      code: "TR_EXPORT_REGISTERED_VAT",
      label: "Türkiye export-registered VAT",
      rate: rateInfo.rate,
      baseCodes: ["GOODS"],
      sourceType: SourceType.OFFICIAL,
      sourceName: "GIB - KDV Kanunu 11/1-c tecil-terkin",
      sourceYear,
      country: "TR",
      treatment: TaxTreatment.DEFERRED,
      affectsLandedCost: false,
      recoverability: "NOT_PAID_TO_SUPPLIER",
      rateStatus: rateInfo.rateStatus,
      requiresRateVerification: rateInfo.requiresRateVerification,
      metadata: {
        mode,
        cashCost: 0,
        note: "VAT is calculated on the invoice but is not paid by the exporter to the manufacturer when statutory conditions are met."
      }
    });
  }

  if (mode === TrVatMode.IMPORT_VAT) {
    return createPercentageTaxLine({
      code: "TR_IMPORT_VAT",
      label: "Türkiye import VAT",
      rate: rateInfo.rate,
      baseCodes: [
        "GOODS",
        "FREIGHT_INTL",
        "INSURANCE",
        "DUTY",
        "EXCISE",
        "IMPORT_TAXES",
        "IMPORT_FEES_TAXABLE"
      ],
      sourceType: SourceType.OFFICIAL,
      sourceName: "GIB - KDV Kanunu Article 21",
      sourceYear,
      country: "TR",
      treatment: TaxTreatment.NORMAL,
      affectsLandedCost: true,
      recoverability: "CONTEXT_DEPENDENT",
      rateStatus: rateInfo.rateStatus,
      requiresRateVerification: rateInfo.requiresRateVerification,
      metadata: {
        mode,
        note: "Import VAT base follows the statutory import VAT base; additional taxable charges may need to be included before declaration."
      }
    });
  }

  throw new Error(`Unsupported Türkiye VAT mode: ${mode}`);
}
