export const CustomsValuationStatus = Object.freeze({
  UNRESOLVED: "UNRESOLVED",
  WORKING: "WORKING",
  VERIFIED: "VERIFIED"
});

export const CustomsAdjustmentType = Object.freeze({
  FREIGHT_TO_BORDER: "FREIGHT_TO_BORDER",
  INSURANCE_TO_BORDER: "INSURANCE_TO_BORDER",
  PACKING: "PACKING",
  ASSISTS: "ASSISTS",
  ROYALTIES_LICENSE_FEES: "ROYALTIES_LICENSE_FEES",
  SELLING_COMMISSION: "SELLING_COMMISSION",
  PROCEEDS_TO_SELLER: "PROCEEDS_TO_SELLER",
  OTHER_ADDITION: "OTHER_ADDITION",
  POST_IMPORT_TRANSPORT: "POST_IMPORT_TRANSPORT",
  IMPORT_DUTIES_TAXES: "IMPORT_DUTIES_TAXES",
  OTHER_DEDUCTION: "OTHER_DEDUCTION"
});

const ADDITION_TYPES = new Set([
  CustomsAdjustmentType.FREIGHT_TO_BORDER,
  CustomsAdjustmentType.INSURANCE_TO_BORDER,
  CustomsAdjustmentType.PACKING,
  CustomsAdjustmentType.ASSISTS,
  CustomsAdjustmentType.ROYALTIES_LICENSE_FEES,
  CustomsAdjustmentType.SELLING_COMMISSION,
  CustomsAdjustmentType.PROCEEDS_TO_SELLER,
  CustomsAdjustmentType.OTHER_ADDITION
]);

const DEDUCTION_TYPES = new Set([
  CustomsAdjustmentType.POST_IMPORT_TRANSPORT,
  CustomsAdjustmentType.IMPORT_DUTIES_TAXES,
  CustomsAdjustmentType.OTHER_DEDUCTION
]);

function nonNegative(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} must be a non-negative number`);
  return n;
}

export function normalizeCustomsAdjustments(adjustments = []) {
  if (!Array.isArray(adjustments)) throw new Error("adjustments must be an array");

  return adjustments.map((item, index) => {
    const type = String(item?.type || "").trim().toUpperCase();
    if (!Object.values(CustomsAdjustmentType).includes(type)) {
      throw new Error(`Unsupported customs adjustment type at index ${index}`);
    }

    const amount = nonNegative(item.amount, `adjustments[${index}].amount`);
    const direction = ADDITION_TYPES.has(type)
      ? "ADD"
      : DEDUCTION_TYPES.has(type)
        ? "DEDUCT"
        : null;

    return {
      type,
      amount,
      direction,
      verified: item.verified === true,
      sourceType: item.sourceType || "MANUAL",
      sourceName: item.sourceName || null,
      note: item.note || null
    };
  });
}

export function calculateCustomsValue({
  transactionValue,
  adjustments = [],
  status = CustomsValuationStatus.WORKING,
  country = null,
  method = "TRANSACTION_VALUE"
} = {}) {
  const base = nonNegative(transactionValue, "transactionValue");
  const normalized = normalizeCustomsAdjustments(adjustments);

  const additions = normalized
    .filter(x => x.direction === "ADD")
    .reduce((sum, x) => sum + x.amount, 0);

  const deductions = normalized
    .filter(x => x.direction === "DEDUCT")
    .reduce((sum, x) => sum + x.amount, 0);

  const value = base + additions - deductions;
  if (value < 0) throw new Error("Customs value cannot be negative");

  const unresolvedAdjustments = normalized.filter(x => !x.verified && x.amount > 0);

  return {
    country: country ? String(country).trim().toUpperCase() : null,
    method,
    status,
    transactionValue: base,
    additions,
    deductions,
    value,
    adjustments: normalized,
    requiresVerification: status !== CustomsValuationStatus.VERIFIED || unresolvedAdjustments.length > 0,
    unresolvedAdjustments: unresolvedAdjustments.map(x => x.type),
    policy: "COUNTRY_SPECIFIC_RULE_REQUIRED",
    note: "This engine calculates a working customs value from explicit inputs. Whether each adjustment is legally includable or deductible must be verified under the destination country's customs valuation rules."
  };
}

export function assertVerifiedCustomsValue(input) {
  const result = calculateCustomsValue(input);
  if (result.requiresVerification) {
    throw new Error("Customs value is not fully verified");
  }
  return result;
}
