import {
  buildBackhaulProviderPlan,
  listBackhaulProviders
} from "../../packages/providers/src/backhaul.js";

function json(body,status=200){
  return Response.json(body,{
    status,
    headers:{"Cache-Control":status===200?"public, max-age=3600":"no-store"}
  });
}

export async function onRequestGet({request}){
  const url=new URL(request.url);
  const action=(url.searchParams.get("action")||"plan").trim().toLowerCase();

  if(action==="providers"){
    return json({
      provider:"backhaul-provider-registry",
      sourceType:"MARKETPLACE_REGISTRY",
      autoApply:false,
      providers:listBackhaulProviders()
    });
  }

  if(action!=="plan"){
    return json({error:"Unsupported action",availableActions:["plan","providers"]},400);
  }

  const transportMode=(url.searchParams.get("mode")||"").trim().toUpperCase();
  try{
    return json({
      provider:"backhaul-provider-registry",
      generatedAt:new Date().toISOString(),
      ...buildBackhaulProviderPlan({transportMode})
    });
  }catch(error){
    return json({
      error:"Invalid backhaul provider request",
      message:error instanceof Error?error.message:String(error)
    },400);
  }
}
