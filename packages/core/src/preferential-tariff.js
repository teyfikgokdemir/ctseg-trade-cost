export const PreferentialEligibility = Object.freeze({
  NOT_CONFIRMED: "NOT_CONFIRMED",
  ELIGIBLE: "ELIGIBLE",
  NOT_ELIGIBLE: "NOT_ELIGIBLE"
});

function finiteRate(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function resolvePreferentialTariff({
  mfnRate,
  candidateRate = null,
  eligibilityStatus = PreferentialEligibility.NOT_CONFIRMED,
  verifiedPreferentialRate = null,
  schemeReference = null
} = {}) {
  const mfn = finiteRate(mfnRate);
  const candidate = finiteRate(candidateRate);
  const verified = finiteRate(verifiedPreferentialRate);
  const scheme = String(schemeReference || "").trim();

  if (!Object.values(PreferentialEligibility).includes(eligibilityStatus)) {
    throw new Error("Unsupported preferential eligibility status");
  }

  if (eligibilityStatus === PreferentialEligibility.ELIGIBLE && verified !== null && scheme) {
    return {
      rate: verified,
      basis: "PREFERENTIAL_VERIFIED",
      eligibilityStatus,
      schemeReference: scheme,
      candidateRate: candidate,
      mfnRate: mfn,
      requiresVerification: false,
      reason: "Verified preferential eligibility, scheme reference and executable rate were supplied."
    };
  }

  return {
    rate: mfn,
    basis: mfn !== null ? "MFN" : null,
    eligibilityStatus,
    schemeReference: scheme || null,
    candidateRate: candidate,
    mfnRate: mfn,
    requiresVerification: eligibilityStatus === PreferentialEligibility.ELIGIBLE,
    reason: eligibilityStatus === PreferentialEligibility.ELIGIBLE
      ? "Preferential eligibility was indicated but a verified rate and scheme reference are still required; MFN remains the safe default."
      : eligibilityStatus === PreferentialEligibility.NOT_ELIGIBLE
        ? "Preferential treatment was marked not eligible; MFN remains applicable."
        : "Preferential eligibility is not confirmed; MFN remains the safe default."
  };
}
