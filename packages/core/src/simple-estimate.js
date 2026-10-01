export const SimpleEstimateDefaults = Object.freeze({
  ROAD: { freightPerMt: 110, freightRangePct: 35 },
  SEA: { freightPerMt: 70, freightRangePct: 40 },
  RAIL: { freightPerMt: 85, freightRangePct: 35 },
  AIR: { freightPerMt: 2200, freightRangePct: 45 },
  MULTIMODAL: { freightPerMt: 130, freightRangePct: 40 }
});

function nn(value, field){
  const n=Number(value);
  if(!Number.isFinite(n)||n<0) throw new Error(field+" must be a non-negative number");
  return n;
}

export function estimateGeneralLandedCost({
  goodsValue,
  quantityMt,
  transportMode="ROAD",
  freightPerMt=null,
  customsDutyRate=null,
  importTaxRate=null,
  insurancePct=0.35,
  localCostPct=1.25
}={}){
  const goods=nn(goodsValue,"goodsValue");
  const mt=nn(quantityMt,"quantityMt");
  const mode=String(transportMode||"ROAD").trim().toUpperCase();
  const defaults=SimpleEstimateDefaults[mode]||SimpleEstimateDefaults.ROAD;

  const freightRate=freightPerMt===null||freightPerMt===undefined||freightPerMt===""
    ? defaults.freightPerMt
    : nn(freightPerMt,"freightPerMt");
  const freight=mt*freightRate;

  const dutyRate=customsDutyRate===null||customsDutyRate===undefined||customsDutyRate===""
    ? 5
    : nn(customsDutyRate,"customsDutyRate");
  const insurance=goods*(nn(insurancePct,"insurancePct")/100);
  const customsBase=goods+freight+insurance;
  const duty=customsBase*(dutyRate/100);

  const taxRate=importTaxRate===null||importTaxRate===undefined||importTaxRate===""
    ? 10
    : nn(importTaxRate,"importTaxRate");
  const importTax=(customsBase+duty)*(taxRate/100);

  const localCosts=(goods+freight)*(nn(localCostPct,"localCostPct")/100);
  const total=goods+freight+insurance+duty+importTax+localCosts;

  const low=goods
    + freight*(1-defaults.freightRangePct/100)
    + insurance
    + duty*0.7
    + importTax*0.8
    + localCosts*0.7;
  const high=goods
    + freight*(1+defaults.freightRangePct/100)
    + insurance*1.3
    + duty*1.3
    + importTax*1.2
    + localCosts*1.4;

  return {
    goods,
    quantityMt:mt,
    transportMode:mode,
    freight,
    freightPerMt:freightRate,
    insurance,
    customsBase,
    duty,
    dutyRate,
    importTax,
    importTaxRate:taxRate,
    localCosts,
    total,
    range:{low,high},
    estimate:true,
    assumptions:{
      freightFallback:freightPerMt===null||freightPerMt===undefined||freightPerMt==="",
      dutyFallback:customsDutyRate===null||customsDutyRate===undefined||customsDutyRate==="",
      taxFallback:importTaxRate===null||importTaxRate===undefined||importTaxRate==="",
      insurancePct,
      localCostPct
    }
  };
}
