import {
  buildTradeRemedyLookupPlan,
  listTradeRemedyProviders
} from "../../packages/providers/src/trade-remedies.js";

function json(body,status=200){
  return Response.json(body,{
    status,
    headers:{"Cache-Control":status===200?"public, max-age=3600":"no-store"}
  });
}

export async function onRequestGet({request}){
  const url=new URL(request.url);
  const action=(url.searchParams.get("action")||"lookup").trim().toLowerCase();

  if(action==="providers"){
    return json({
      provider:"trade-remedy-provider-registry",
      sourceType:"OFFICIAL",
      autoApply:false,
      providers:listTradeRemedyProviders(),
      disclaimer:"Provider availability does not prove that a trade remedy applies. Product scope, origin, exporter/producer, legal measure, dates, additional codes and executable rate must be verified."
    });
  }

  if(action!=="lookup"){
    return json({error:"Unsupported action",availableActions:["lookup","providers"]},400);
  }

  const originCountry=(url.searchParams.get("origin")||"").trim().toUpperCase();
  const importCountry=(url.searchParams.get("import")||"").trim().toUpperCase();
  const hsCode=(url.searchParams.get("hs")||"").trim();
  const type=(url.searchParams.get("type")||"").trim().toUpperCase()||null;

  try{
    const plan=buildTradeRemedyLookupPlan({originCountry,importCountry,hsCode,type});
    return json({
      provider:"trade-remedy-provider-registry",
      sourceType:"OFFICIAL",
      retrievedAt:new Date().toISOString(),
      ...plan,
      disclaimer:"This endpoint identifies official discovery/reference sources only. It does not establish legal scope or an executable duty rate."
    });
  }catch(error){
    return json({
      error:"Invalid trade-remedy lookup",
      message:error instanceof Error?error.message:String(error)
    },400);
  }
}
