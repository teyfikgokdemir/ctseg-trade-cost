export const Incoterm = Object.freeze({
  EXW: "EXW",
  FCA: "FCA",
  CPT: "CPT",
  CIP: "CIP",
  DAP: "DAP",
  DPU: "DPU",
  DDP: "DDP",
  FAS: "FAS",
  FOB: "FOB",
  CFR: "CFR",
  CIF: "CIF"
});

const PROFILES = Object.freeze({
  EXW: {
    modes: ["ANY"],
    sellerIncludedCostCodes: [],
    buyerUsuallyAdds: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  FCA: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE"],
    buyerUsuallyAdds: ["FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  CPT: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL"],
    buyerUsuallyAdds: ["INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  CIP: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE"],
    buyerUsuallyAdds: ["DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  DAP: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","DESTINATION_INLAND"],
    buyerUsuallyAdds: ["IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE"]
  },
  DPU: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","DESTINATION_INLAND","UNLOADING"],
    buyerUsuallyAdds: ["IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE"]
  },
  DDP: {
    modes: ["ANY"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"],
    buyerUsuallyAdds: []
  },
  FAS: {
    modes: ["SEA"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE"],
    buyerUsuallyAdds: ["FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  FOB: {
    modes: ["SEA"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE"],
    buyerUsuallyAdds: ["FREIGHT_INTL","INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  CFR: {
    modes: ["SEA"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL"],
    buyerUsuallyAdds: ["INSURANCE","DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  },
  CIF: {
    modes: ["SEA"],
    sellerIncludedCostCodes: ["ORIGIN_INLAND","EXPORT_CLEARANCE","FREIGHT_INTL","INSURANCE"],
    buyerUsuallyAdds: ["DESTINATION_CHARGES","IMPORT_DUTY","IMPORT_TAX","CUSTOMS_BROKERAGE","DESTINATION_INLAND"]
  }
});

export function getIncotermProfile(term) {
  const code=String(term||"").trim().toUpperCase();
  if(!PROFILES[code]) throw new Error("Unsupported Incoterm");
  return { code, ...structuredClone(PROFILES[code]) };
}

export function isIncotermModeCompatible(term, transportMode) {
  const profile=getIncotermProfile(term);
  const mode=String(transportMode||"").trim().toUpperCase();
  return profile.modes.includes("ANY") || profile.modes.includes(mode);
}

export function findPotentialIncotermDoubleCounts({ incoterm, costs=[] }={}) {
  const profile=getIncotermProfile(incoterm);
  const included=new Set(profile.sellerIncludedCostCodes);
  return costs
    .filter(cost=>included.has(cost.code))
    .filter(cost=>Number(cost.amount ?? cost.rate ?? 0)>0)
    .map(cost=>({
      code: cost.code,
      label: cost.label || cost.code,
      reason: "LIKELY_INCLUDED_IN_SUPPLIER_INCOTERM_PRICE"
    }));
}

export function getIncotermCostScope(term) {
  const profile=getIncotermProfile(term);
  return {
    incoterm: profile.code,
    sellerIncludedCostCodes: profile.sellerIncludedCostCodes,
    buyerUsuallyAdds: profile.buyerUsuallyAdds,
    customsValuationPolicy: "COUNTRY_RULE_REQUIRED"
  };
}
