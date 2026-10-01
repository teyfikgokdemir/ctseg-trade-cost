const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]);

const TEDB_ENDPOINT = "https://ec.europa.eu/taxation_customs/tedb/ws/VatRetrievalService";

function xmlEscape(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

function tedbCountry(code){
  return code==="GR" ? "EL" : code;
}

function stripTags(value){
  return String(value||"").replace(/<[^>]+>/g,"").trim();
}

function extractVatResults(xml){
  const blocks=String(xml||"").match(/<(?:\w+:)?vatRateResults\b[\s\S]*?<\/(?:\w+:)?vatRateResults>/gi)||[];
  return blocks.map(block=>{
    const type=stripTags(block.match(/<(?:\w+:)?type>([\s\S]*?)<\/(?:\w+:)?type>/i)?.[1]).toUpperCase();
    const rateBlock=block.match(/<(?:\w+:)?rate\b[\s\S]*?<\/(?:\w+:)?rate>/i)?.[0]||"";
    const valueRaw=stripTags(rateBlock.match(/<(?:\w+:)?value>([\s\S]*?)<\/(?:\w+:)?value>/i)?.[1]);
    const rate=Number(valueRaw);
    const cnBlock=block.match(/<(?:\w+:)?cnCodes\b[\s\S]*?<\/(?:\w+:)?cnCodes>/i)?.[0]||"";
    const cnValues=[...cnBlock.matchAll(/<(?:\w+:)?value>(\d{4,10})<\/(?:\w+:)?value>/gi)].map(m=>m[1]);
    return {
      type,
      rate:Number.isFinite(rate)?rate:null,
      cnCodes:[...new Set(cnValues)]
    };
  }).filter(x=>x.rate!==null);
}

export function isEuVatCountry(country){
  return EU27.has(String(country||"").trim().toUpperCase());
}

export function buildTedbVatRequest({country,hsCode=null,date=null}={}){
  const code=String(country||"").trim().toUpperCase();
  if(!isEuVatCountry(code)) throw new Error("TEDB VAT provider supports EU27 destinations only");
  const hs=hsCode===null||hsCode===undefined||hsCode===""?null:String(hsCode).trim();
  if(hs && !/^\d{6,10}$/.test(hs)) throw new Error("hsCode must be 6-10 digits");
  const day=date||new Date().toISOString().slice(0,10);

  const cnBlock=hs
    ? `<typ:cnCodes><typ:value>${xmlEscape(hs)}</typ:value></typ:cnCodes>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
 xmlns:urn="urn:ec.europa.eu:taxud:tedb:services:v1:IVatRetrievalService"
 xmlns:typ="urn:ec.europa.eu:taxud:tedb:services:v1:IVatRetrievalService:types">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:retrieveVatRatesReqMsg>
      <typ:memberStates><typ:isoCode>${xmlEscape(tedbCountry(code))}</typ:isoCode></typ:memberStates>
      <typ:from>${xmlEscape(day)}</typ:from>
      <typ:to>${xmlEscape(day)}</typ:to>
      ${cnBlock}
    </urn:retrieveVatRatesReqMsg>
  </soapenv:Body>
</soapenv:Envelope>`;
}

export async function fetchEuVatRates({country,hsCode=null,date=null,fetchImpl=fetch}={}){
  const body=buildTedbVatRequest({country,hsCode,date});
  const response=await fetchImpl(TEDB_ENDPOINT,{
    method:"POST",
    headers:{
      "content-type":"text/xml; charset=utf-8",
      "soapaction":"urn:ec.europa.eu:taxud:tedb:services:v1:VatRetrievalService/RetrieveVatRates"
    },
    body
  });

  const text=await response.text();
  if(!response.ok){
    throw new Error(`TEDB VAT request failed with HTTP ${response.status}`);
  }
  if(/<(?:\w+:)?Fault\b/i.test(text)){
    throw new Error("TEDB VAT service returned SOAP Fault");
  }

  const rates=extractVatResults(text);
  const standard=rates.find(x=>x.type==="STANDARD")||null;
  const reduced=rates.filter(x=>x.type==="REDUCED");

  return {
    provider:"EU_TEDB",
    sourceType:"OFFICIAL",
    sourceName:"European Commission Taxes in Europe Database (TEDB)",
    sourceUrl:"https://ec.europa.eu/taxation_customs/tedb/index.html",
    country:String(country).trim().toUpperCase(),
    hsCode:hsCode||null,
    queriedAt:new Date().toISOString(),
    standardRate:standard?.rate??null,
    productCandidates:reduced,
    allRates:rates,
    productSpecificResolved:Boolean(hsCode && rates.some(x=>x.cnCodes.some(code=>String(hsCode).startsWith(code)||code.startsWith(String(hsCode))))),
    disclaimer:"TEDB data is supplied by EU Member States. Product-specific VAT treatment and legal applicability should be verified when multiple/reduced rates are returned."
  };
}
