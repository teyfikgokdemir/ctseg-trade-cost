const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]);

export const TradeRemedyProviderMode = Object.freeze({
  DISCOVERY: "DISCOVERY",
  EXECUTION_REFERENCE: "EXECUTION_REFERENCE",
  MANUAL_FALLBACK: "MANUAL_FALLBACK"
});

const PROVIDERS = Object.freeze([
  {
    id: "eu-taric",
    name: "EU TARIC",
    authority: "European Commission",
    destinations: "EU27",
    types: ["ANTI_DUMPING","COUNTERVAILING","SAFEGUARD","ADDITIONAL_TARIFF","OTHER_TRADE_REMEDY"],
    mode: TradeRemedyProviderMode.DISCOVERY,
    sourceType: "OFFICIAL",
    sourceUrl: "https://taxation-customs.ec.europa.eu/online-services/online-services-and-databases-customs/eu-customs-tariff-taric_en",
    capabilities: {
      originAware: true,
      hsAware: true,
      exporterAdditionalCodeMayBeRequired: true,
      directExecutableRate: false
    },
    notes: [
      "TARIC integrates EU trade-defence measures including anti-dumping, countervailing and safeguard duties.",
      "Exact executable treatment may depend on TARIC additional codes, exporter identity, legal act, date and product scope."
    ]
  },
  {
    id: "us-ita-adcvd",
    name: "U.S. ITA AD/CVD Search",
    authority: "U.S. Department of Commerce, International Trade Administration",
    destinations: ["US"],
    types: ["ANTI_DUMPING","COUNTERVAILING"],
    mode: TradeRemedyProviderMode.DISCOVERY,
    sourceType: "OFFICIAL",
    sourceUrl: "https://beta.trade.gov/adcvd-search",
    capabilities: {
      originAware: true,
      hsAware: true,
      exporterAdditionalCodeMayBeRequired: true,
      directExecutableRate: false
    },
    notes: [
      "The portal supports discovery by country, product, case number, HTS number or commodity.",
      "Scope and case-specific cash-deposit treatment must be verified before landed-cost application."
    ]
  },
  {
    id: "us-cbp-adcvd",
    name: "U.S. CBP AD/CVD / ACE",
    authority: "U.S. Customs and Border Protection",
    destinations: ["US"],
    types: ["ANTI_DUMPING","COUNTERVAILING"],
    mode: TradeRemedyProviderMode.EXECUTION_REFERENCE,
    sourceType: "OFFICIAL",
    sourceUrl: "https://www.cbp.gov/trade/priority-issues/adcvd",
    capabilities: {
      originAware: true,
      hsAware: true,
      exporterAdditionalCodeMayBeRequired: true,
      directExecutableRate: false
    },
    notes: [
      "CBP enforces and collects AD/CVD and provides case/message resources.",
      "ACE case-query access may be required for executable entry treatment."
    ]
  }
]);

function validateIso2(value, field) {
  const code=String(value||"").trim().toUpperCase();
  if(!/^[A-Z]{2}$/.test(code)) throw new Error(field+" must be ISO2");
  return code;
}

function validateHs(value) {
  const hs=String(value||"").trim();
  if(!/^\d{6,10}$/.test(hs)) throw new Error("hsCode must be 6-10 digits");
  return hs;
}

function supportsDestination(provider, destination) {
  if(provider.destinations==="EU27") return EU27.has(destination);
  return provider.destinations.includes(destination);
}

export function listTradeRemedyProviders() {
  return PROVIDERS.map(x=>structuredClone(x));
}

export function selectTradeRemedyProviders({ importCountry, type=null }={}) {
  const destination=validateIso2(importCountry,"importCountry");
  return PROVIDERS
    .filter(provider=>supportsDestination(provider,destination))
    .filter(provider=>!type || provider.types.includes(type))
    .map(provider=>structuredClone(provider));
}

export function buildTradeRemedyLookupPlan({
  originCountry,
  importCountry,
  hsCode,
  type=null
}={}) {
  const origin=validateIso2(originCountry,"originCountry");
  const destination=validateIso2(importCountry,"importCountry");
  const hs=validateHs(hsCode);
  const providers=selectTradeRemedyProviders({importCountry:destination,type});

  return {
    originCountry:origin,
    importCountry:destination,
    hsCode:hs,
    type:type||null,
    status:providers.length ? "OFFICIAL_PROVIDER_AVAILABLE" : "MANUAL_VERIFICATION_REQUIRED",
    autoApply:false,
    providers,
    safetyRule:"Provider discovery never applies a trade-remedy rate automatically. Scope, exporter, legal reference and executable rate must be verified first."
  };
}
