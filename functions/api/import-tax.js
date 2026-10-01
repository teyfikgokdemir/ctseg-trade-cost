import { fetchEuVatRates, isEuVatCountry } from "../../packages/providers/src/eu-tedb.js";

function json(body,status=200){
  return Response.json(body,{
    status,
    headers:{"Cache-Control":status===200?"public, max-age=1800":"no-store"}
  });
}

export async function onRequestGet({request}){
  const url=new URL(request.url);
  const country=(url.searchParams.get("country")||"").trim().toUpperCase();
  const hs=(url.searchParams.get("hs")||"").trim()||null;

  if(!country){
    return json({error:"country is required"},400);
  }

  if(!isEuVatCountry(country)){
    return json({
      provider:"import-tax-router",
      country,
      status:"NO_OFFICIAL_PROVIDER_CONNECTED",
      sourceType:"RULE_REGISTRY",
      autoApply:false,
      message:"No official product-specific import VAT/GST provider is connected for this destination yet."
    });
  }

  try{
    const data=await fetchEuVatRates({country,hsCode:hs});
    return json({
      provider:"import-tax-router",
      country,
      status:data.productSpecificResolved ? "PRODUCT_RATE_CANDIDATES_AVAILABLE" : "STANDARD_RATE_AVAILABLE",
      autoApply:false,
      result:data
    });
  }catch(error){
    return json({
      provider:"import-tax-router",
      country,
      status:"OFFICIAL_PROVIDER_UNAVAILABLE",
      autoApply:false,
      error:"EU TEDB VAT lookup failed",
      message:error instanceof Error?error.message:String(error)
    },502);
  }
}
