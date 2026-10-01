function nn(value, field) {
  const n=Number(value);
  if(!Number.isFinite(n) || n<0) throw new Error(field+" must be a non-negative number");
  return n;
}

export const BackhaulEvidence = Object.freeze({
  CONFIRMED_LOAD: "CONFIRMED_LOAD",
  MARKET_SIGNAL: "MARKET_SIGNAL",
  MANUAL_ESTIMATE: "MANUAL_ESTIMATE"
});

export function calculateBackhaulEconomics({
  outboundFreightCost,
  returnLoadRevenue=0,
  returnLoadExtraCost=0,
  emptyReturnKm=0,
  detourKm=0,
  probabilityPct=100,
  evidence=BackhaulEvidence.MANUAL_ESTIMATE
}={}) {
  const outbound=nn(outboundFreightCost,"outboundFreightCost");
  const revenue=nn(returnLoadRevenue,"returnLoadRevenue");
  const extra=nn(returnLoadExtraCost,"returnLoadExtraCost");
  const emptyKm=nn(emptyReturnKm,"emptyReturnKm");
  const detour=nn(detourKm,"detourKm");
  const probability=Math.min(100,nn(probabilityPct,"probabilityPct"));

  if(!Object.values(BackhaulEvidence).includes(evidence)){
    throw new Error("Unsupported backhaul evidence type");
  }

  const expectedRevenue=revenue*(probability/100);
  const expectedBenefit=Math.max(0,expectedRevenue-extra);
  const effectiveOutboundCost=Math.max(0,outbound-expectedBenefit);
  const reductionPct=outbound>0 ? ((outbound-effectiveOutboundCost)/outbound)*100 : 0;

  let confidence="LOW";
  if(evidence===BackhaulEvidence.CONFIRMED_LOAD && probability===100) confidence="HIGH";
  else if(evidence===BackhaulEvidence.MARKET_SIGNAL || probability>=70) confidence="MEDIUM";

  return {
    status: revenue>0 ? "BACKHAUL_AVAILABLE" : "NO_BACKHAUL_EVIDENCE",
    evidence,
    outboundFreightCost:outbound,
    returnLoadRevenue:revenue,
    expectedRevenue,
    returnLoadExtraCost:extra,
    expectedBenefit,
    effectiveOutboundCost,
    reductionPct,
    emptyReturnKm:emptyKm,
    detourKm:detour,
    probabilityPct:probability,
    confidence,
    note: revenue>0
      ? "Backhaul benefit is shown as an economic offset, not as a guaranteed freight discount."
      : "No return-load evidence was supplied. No freight discount was invented."
  };
}

export function backhaulAdjustmentForLandedCost(result,{confirmedOnly=true}={}) {
  if(!result || result.status!=="BACKHAUL_AVAILABLE") return 0;
  if(confirmedOnly && result.evidence!==BackhaulEvidence.CONFIRMED_LOAD) return 0;
  return Math.max(0,Number(result.expectedBenefit)||0);
}
