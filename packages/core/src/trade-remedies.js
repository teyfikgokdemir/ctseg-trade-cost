import { SourceType } from "./engine.js";

export const TradeRemedyType = Object.freeze({
  ANTI_DUMPING: "ANTI_DUMPING",
  COUNTERVAILING: "COUNTERVAILING",
  SAFEGUARD: "SAFEGUARD",
  ADDITIONAL_TARIFF: "ADDITIONAL_TARIFF",
  RETALIATORY_TARIFF: "RETALIATORY_TARIFF",
  OTHER_TRADE_REMEDY: "OTHER_TRADE_REMEDY"
});

export const TradeRemedyRateBasis = Object.freeze({
  CUSTOMS_VALUE_PERCENT: "CUSTOMS_VALUE_PERCENT",
  GOODS_VALUE_PERCENT: "GOODS_VALUE_PERCENT",
  PER_MT: "PER_MT",
  FIXED: "FIXED"
});

function iso2(value, field) {
  const code=String(value||"").trim().toUpperCase();
  if(!/^[A-Z]{2}$/.test(code)) throw new Error(field+" must be ISO2");
  return code;
}

function nonNegative(value, field) {
  if(value===null||value===undefined||value==="") throw new Error(field+" is required");
  const n=Number(value);
  if(!Number.isFinite(n)||n<0) throw new Error(field+" must be a non-negative number");
  return n;
}

export function createVerifiedTradeRemedy({
  type,
  originCountry,
  importCountry,
  hsCode,
  rateBasis=TradeRemedyRateBasis.CUSTOMS_VALUE_PERCENT,
  rate,
  reference,
  sourceType=SourceType.MANUAL,
  sourceName=null,
  validFrom=null,
  validUntil=null,
  exporterScope=null,
  metadata={}
}={}) {
  if(!Object.values(TradeRemedyType).includes(type)) throw new Error("Unsupported trade remedy type");
  if(!Object.values(TradeRemedyRateBasis).includes(rateBasis)) throw new Error("Unsupported trade remedy rate basis");

  const origin=iso2(originCountry,"originCountry");
  const destination=iso2(importCountry,"importCountry");
  const hs=String(hsCode||"").trim();
  if(!/^\d{6,10}$/.test(hs)) throw new Error("hsCode must be 6-10 digits");

  const numericRate=nonNegative(rate,"rate");
  const ref=String(reference||"").trim();
  if(!ref) throw new Error("reference is required for a verified trade remedy");

  return {
    type,
    originCountry:origin,
    importCountry:destination,
    hsCode:hs,
    rateBasis,
    rate:numericRate,
    reference:ref,
    sourceType,
    sourceName,
    validFrom,
    validUntil,
    exporterScope:exporterScope||null,
    verified:true,
    affectsLandedCost:true,
    metadata:{
      tradeRemedy:true,
      ...metadata
    }
  };
}

export function resolveTradeRemedyAmount(remedy,{customsValue,goodsValue,quantityMt}={}) {
  if(!remedy?.verified) throw new Error("Trade remedy must be verified before calculation");
  const rate=nonNegative(remedy.rate,"rate");

  if(remedy.rateBasis===TradeRemedyRateBasis.CUSTOMS_VALUE_PERCENT){
    const base=nonNegative(customsValue,"customsValue");
    return base*(rate/100);
  }
  if(remedy.rateBasis===TradeRemedyRateBasis.GOODS_VALUE_PERCENT){
    const base=nonNegative(goodsValue,"goodsValue");
    return base*(rate/100);
  }
  if(remedy.rateBasis===TradeRemedyRateBasis.PER_MT){
    const qty=nonNegative(quantityMt,"quantityMt");
    return qty*rate;
  }
  if(remedy.rateBasis===TradeRemedyRateBasis.FIXED){
    return rate;
  }
  throw new Error("Unsupported trade remedy rate basis");
}

export function createUnresolvedTradeRemedyCandidate({
  type,
  originCountry,
  importCountry,
  hsCode,
  reference=null,
  metadata={}
}={}) {
  if(!Object.values(TradeRemedyType).includes(type)) throw new Error("Unsupported trade remedy type");
  return {
    type,
    originCountry:iso2(originCountry,"originCountry"),
    importCountry:iso2(importCountry,"importCountry"),
    hsCode:String(hsCode||"").trim(),
    rate:null,
    verified:false,
    requiresVerification:true,
    reference:reference||null,
    metadata:{
      tradeRemedy:true,
      ...metadata
    }
  };
}
