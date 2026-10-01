export const TaxTreatment = Object.freeze({
  NORMAL: "NORMAL",
  DEFERRED: "DEFERRED",
  EXEMPT: "EXEMPT",
  REVERSE_CHARGE: "REVERSE_CHARGE",
  ZERO_RATED: "ZERO_RATED"
});

export function createPercentageTaxLine({
  code,
  label,
  rate,
  baseCodes,
  sourceType = "OFFICIAL",
  sourceName = null,
  sourceYear = null,
  country = null,
  treatment = TaxTreatment.NORMAL,
  affectsLandedCost = true,
  recoverability = "UNKNOWN",
  rateStatus = "VERIFIED",
  requiresRateVerification = false,
  metadata = {}
}) {
  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate < 0) {
    throw new Error("Tax rate must be a non-negative number");
  }

  return {
    code,
    label,
    calc: "pct_codes",
    rate: numericRate,
    baseCodes: [...baseCodes],
    sourceType,
    sourceName,
    sourceYear,
    country,
    treatment,
    affectsLandedCost,
    recoverability,
    rateStatus,
    requiresRateVerification,
    metadata
  };
}
