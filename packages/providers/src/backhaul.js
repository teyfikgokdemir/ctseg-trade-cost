export const BackhaulProviderStatus = Object.freeze({
  AUTH_REQUIRED: "AUTH_REQUIRED",
  CONNECTED: "CONNECTED",
  MANUAL_ONLY: "MANUAL_ONLY"
});

const PROVIDERS = Object.freeze([
  {
    id: "trans-eu",
    name: "Trans.eu",
    authority: "Trans.eu Group",
    transportModes: ["ROAD"],
    status: BackhaulProviderStatus.AUTH_REQUIRED,
    requiresCredentials: true,
    sourceType: "MARKETPLACE",
    sourceUrl: "https://www.trans.eu/api/",
    capabilities: [
      "FREIGHT_EXCHANGE",
      "FREIGHT_PROPOSALS",
      "VEHICLE_EXCHANGE",
      "FREIGHT_STATUS",
      "MONITORING"
    ],
    notes: [
      "API access requires user authorization and an application API key.",
      "Freight-management functionality depends on the user's Trans.eu account and platform permissions."
    ]
  },
  {
    id: "teleroute",
    name: "Teleroute Freight Exchange",
    authority: "Teleroute / Alpega Group",
    transportModes: ["ROAD"],
    status: BackhaulProviderStatus.AUTH_REQUIRED,
    requiresCredentials: true,
    sourceType: "MARKETPLACE",
    sourceUrl: "https://api-docs.teleroute.com/",
    capabilities: [
      "FREIGHT_EXCHANGE",
      "FREIGHT_CRUD",
      "TMS_INTEGRATION"
    ],
    notes: [
      "The REST API provides JSON access to freight-exchange functions.",
      "A business account with API access credentials is required."
    ]
  }
]);

export function listBackhaulProviders(){
  return PROVIDERS.map(p=>structuredClone(p));
}

export function selectBackhaulProviders({transportMode}={}){
  const mode=String(transportMode||"").trim().toUpperCase();
  if(!mode) throw new Error("transportMode is required");

  return PROVIDERS
    .filter(p=>p.transportModes.includes(mode))
    .map(p=>structuredClone(p));
}

export function buildBackhaulProviderPlan({transportMode}={}){
  const providers=selectBackhaulProviders({transportMode});
  return {
    transportMode:String(transportMode).trim().toUpperCase(),
    status:providers.length?"PROVIDERS_AVAILABLE":"MANUAL_ONLY",
    autoApply:false,
    providers,
    fallback:{
      status:BackhaulProviderStatus.MANUAL_ONLY,
      note:"Manual confirmed-load, market-signal or estimate inputs remain available when no marketplace connector is authenticated."
    }
  };
}
