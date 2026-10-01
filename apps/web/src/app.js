const weights={LIVE:1,OFFICIAL:.98,QUOTE:.92,MARKET_AVG:.82,MANUAL:.75,ESTIMATE:.60};
const spreads={LIVE:.02,OFFICIAL:.005,QUOTE:.04,MARKET_AVG:.10,MANUAL:.08,ESTIMATE:.18};
const sourceLabels={LIVE:'Canlı veri',OFFICIAL:'Resmî kaynak',QUOTE:'Güncel teklif',MARKET_AVG:'Piyasa ortalaması',MANUAL:'Manuel veri',ESTIMATE:'Tahmin'};
const methodLabels={FIXED:'Sevkiyat başına',PER_CONTAINER:'Konteyner başına',PER_MT:'MT başına',PCT_GOODS:'Ürün bedelinin %',PCT_CUSTOMS:'Gümrük kıymetinin %'};
const defaults=[
  ['Çıkış iç nakliye','PER_CONTAINER',1800,'MARKET_AVG'],
  ['İhracat gümrüğü ve belgeler','FIXED',950,'MARKET_AVG'],
  ['Uluslararası navlun','PER_CONTAINER',5600,'MARKET_AVG'],
  ['Yük sigortası','PCT_GOODS',0.35,'QUOTE'],
  ['Varış / sınır masrafları','PER_CONTAINER',1200,'ESTIMATE'],
  ['İthalat gümrük vergisi','PCT_CUSTOMS',5,'OFFICIAL'],
  ['Gümrük müşavirliği','FIXED',1300,'MARKET_AVG'],
  ['Varış iç nakliye','PER_CONTAINER',1600,'ESTIMATE']
];
const rows=document.querySelector('#costRows');
const quoteStoreKey='ctseg_trade_cost_quotes_v1';

function money(n,d=2){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Number(n)||0)}
function positive(selector){const v=Number(document.querySelector(selector).value);return Number.isFinite(v)&&v>0?v:null}
function todayISO(){return new Date().toISOString().slice(0,10)}
function normalizeText(v){return (v||'').trim().toLowerCase().replace(/\s+/g,' ')}

function shipment(){
  const count=positive('#containerCount')||0;
  const payload=positive('#payloadPerContainer')||0;
  const mt=count*payload;
  return {count,payload,mt,kg:mt*1000,litres:mt*1000};
}
function purchaseBasis(){
  const s=shipment();
  const unit=document.querySelector('#priceUnit').value;
  if(unit==='USD_L') return {qty:s.litres,suffix:'USD / litre'};
  if(unit==='USD_KG') return {qty:s.kg,suffix:'USD / kg'};
  return {qty:s.mt,suffix:'USD / MT'};
}
function goodsTotal(){return (positive('#price')||0)*purchaseBasis().qty}

function calculateRow(row,{excludeCustoms=false}={}){
  const s=shipment();
  const method=row.querySelector('.method').value;
  const rate=Math.max(0,Number(row.querySelector('.rate').value)||0);
  if(method==='FIXED') return rate;
  if(method==='PER_CONTAINER') return rate*s.count;
  if(method==='PER_MT') return rate*s.mt;
  if(method==='PCT_GOODS') return goodsTotal()*(rate/100);
  if(method==='PCT_CUSTOMS'){
    if(excludeCustoms) return 0;
    return customsBase()*(rate/100);
  }
  return 0;
}
function customsBase(){
  const costRows=[...document.querySelectorAll('.cost-row')];
  const freight=costRows
    .filter(r=>/navlun|freight|nakliye/i.test(r.querySelector('.label').value))
    .reduce((sum,r)=>sum+calculateRow(r,{excludeCustoms:true}),0);
  const insurance=costRows
    .filter(r=>/sigorta|insurance/i.test(r.querySelector('.label').value))
    .reduce((sum,r)=>sum+calculateRow(r,{excludeCustoms:true}),0);
  return goodsTotal()+freight+insurance;
}
function addRow([label='',method='FIXED',rate=0,source='ESTIMATE']={}){
  const div=document.createElement('div');
  div.className='cost-row';
  div.innerHTML=`
    <input class="label" value="${label}">
    <select class="method">${Object.keys(methodLabels).map(k=>`<option value="${k}" ${k===method?'selected':''}>${methodLabels[k]}</option>`).join('')}</select>
    <input class="rate" type="number" min="0" step="0.01" value="${rate}">
    <select class="source">${Object.keys(sourceLabels).map(k=>`<option value="${k}" ${k===source?'selected':''}>${sourceLabels[k]}</option>`).join('')}</select>
    <output class="computed">$0</output>
    <button type="button" title="Sil">×</button>`;
  div.querySelector('button').addEventListener('click',()=>{div.remove();refreshCalculatedAmounts()});
  div.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',refreshCalculatedAmounts));
  rows.appendChild(div);
}
function refreshCalculatedAmounts(){
  [...document.querySelectorAll('.cost-row')].forEach(row=>{
    row.querySelector('.computed').textContent='$'+money(calculateRow(row),0);
  });
}
function syncShipment(){
  document.querySelector('#totalMt').value=shipment().mt.toFixed(2);
  refreshCalculatedAmounts();
  renderQuoteSummary();
}

defaults.forEach(addRow);
document.querySelector('#addCost').addEventListener('click',()=>addRow());
['containerCount','payloadPerContainer','price','priceUnit'].forEach(id=>document.querySelector('#'+id).addEventListener('input',syncShipment));
['origin','destination','containerType'].forEach(id=>document.querySelector('#'+id).addEventListener('input',renderQuoteSummary));
syncShipment();

function loadQuotes(){
  try{return JSON.parse(localStorage.getItem(quoteStoreKey)||'[]')}catch{return []}
}
function saveQuotes(quotes){localStorage.setItem(quoteStoreKey,JSON.stringify(quotes))}
function currentQuoteKey(){
  return {
    origin:normalizeText(document.querySelector('#origin').value),
    destination:normalizeText(document.querySelector('#destination').value),
    containerType:document.querySelector('#containerType').value
  };
}
function matchingQuotes(){
  const key=currentQuoteKey();
  const now=todayISO();
  return loadQuotes()
    .filter(q=>normalizeText(q.origin)===key.origin&&normalizeText(q.destination)===key.destination&&q.containerType===key.containerType)
    .filter(q=>!q.validUntil||q.validUntil>=now)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function weightedQuoteAverage(quotes){
  if(!quotes.length) return null;
  const now=Date.now();
  let num=0,den=0;
  for(const q of quotes){
    const ageDays=Math.max(0,(now-new Date(q.date+'T12:00:00Z').getTime())/86400000);
    const w=Math.pow(0.5,ageDays/30);
    num+=q.rate*w; den+=w;
  }
  return den?num/den:null;
}
function renderQuoteSummary(){
  const matches=matchingQuotes();
  const avg=weightedQuoteAverage(matches);
  const latest=matches[0];
  document.querySelector('#matchedQuoteCount').textContent=String(matches.length);
  document.querySelector('#matchedQuoteAverage').textContent=avg?'$'+money(avg,0)+' / konteyner':'—';
  document.querySelector('#latestQuoteValue').textContent=latest?'$'+money(latest.rate,0)+' / konteyner':'—';
  document.querySelector('#quoteDataStatus').textContent=matches.length>=3?'Güçlü veri':matches.length===2?'Orta veri':matches.length===1?'Tek teklif':'Veri yok';

  const list=document.querySelector('#quoteList');
  list.innerHTML=matches.slice(0,6).map(q=>`
    <div class="quote-item">
      <div><strong>${q.provider||'Forwarder'}</strong><span>${q.date} · ${q.containerType}</span></div>
      <b>$${money(q.rate,0)}</b>
      <button data-id="${q.id}" type="button">Sil</button>
    </div>`).join('') || '<p class="empty">Bu rota ve konteyner tipi için kayıtlı geçerli teklif yok.</p>';
  list.querySelectorAll('button[data-id]').forEach(btn=>btn.addEventListener('click',()=>{
    saveQuotes(loadQuotes().filter(q=>q.id!==btn.dataset.id));
    renderQuoteSummary();
  }));
}
document.querySelector('#quoteDate').value=todayISO();
document.querySelector('#saveQuote').addEventListener('click',()=>{
  const provider=document.querySelector('#quoteProvider').value.trim();
  const rate=positive('#quoteRate');
  const date=document.querySelector('#quoteDate').value||todayISO();
  const validUntil=document.querySelector('#quoteValidUntil').value||null;
  if(!rate){alert('Teklif tutarını girin.');return}
  const quotes=loadQuotes();
  quotes.push({
    id:String(Date.now()),
    provider,
    rate,
    date,
    validUntil,
    origin:document.querySelector('#origin').value,
    destination:document.querySelector('#destination').value,
    containerType:document.querySelector('#containerType').value
  });
  saveQuotes(quotes);
  document.querySelector('#quoteRate').value='';
  renderQuoteSummary();
});
document.querySelector('#applyQuoteAverage').addEventListener('click',()=>{
  const matches=matchingQuotes();
  const avg=weightedQuoteAverage(matches);
  if(!avg){alert('Bu rota için geçerli teklif bulunamadı.');return}
  const freight=[...document.querySelectorAll('.cost-row')].find(r=>/uluslararası navlun|international freight|freight/i.test(r.querySelector('.label').value));
  if(!freight){alert('Uluslararası navlun satırı bulunamadı.');return}
  freight.querySelector('.rate').value=Math.round(avg);
  freight.querySelector('.source').value=matches.length===1?'QUOTE':'MARKET_AVG';
  refreshCalculatedAmounts();
});
renderQuoteSummary();

document.querySelector('#calculate').addEventListener('click',()=>{
  const s=shipment();
  const price=positive('#price');
  if(!s.count||!s.payload||!price){alert('Konteyner sayısı, net yük ve alış fiyatını kontrol edin.');return}
  const goods=goodsTotal();
  const costRows=[...document.querySelectorAll('.cost-row')];
  const costs=costRows.map(row=>({amount:calculateRow(row),source:row.querySelector('.source').value}));
  const extra=costs.reduce((sum,c)=>sum+c.amount,0);
  const total=goods+extra;
  const low=goods+costs.reduce((sum,c)=>sum+c.amount*(1-spreads[c.source]),0);
  const high=goods+costs.reduce((sum,c)=>sum+c.amount*(1+spreads[c.source]),0);
  const confidence=Math.round(((goods*.92)+costs.reduce((sum,c)=>sum+c.amount*weights[c.source],0))/total*100);
  const estimatedAmount=costs.filter(c=>c.source==='ESTIMATE').reduce((sum,c)=>sum+c.amount,0);
  const estimateShare=extra?estimatedAmount/extra*100:0;
  const basis=purchaseBasis();

  document.querySelector('#unitFinal').textContent='$'+money(total/basis.qty,4);
  document.querySelector('#unitFinalLabel').textContent=basis.suffix;
  document.querySelector('#goodsTotal').textContent='$'+money(goods,0);
  document.querySelector('#extraTotal').textContent='$'+money(extra,0);
  document.querySelector('#total').textContent='$'+money(total,0);
  document.querySelector('#goodsUnit').textContent='$'+money(goods/basis.qty,4);
  document.querySelector('#goodsUnitLabel').textContent=basis.suffix;
  document.querySelector('#extraUnit').textContent='$'+money(extra/basis.qty,4);
  document.querySelector('#extraUnitLabel').textContent=basis.suffix;
  document.querySelector('#shipmentSummary').textContent=`${s.count} × ${document.querySelector('#containerType').value}`;
  document.querySelector('#shipmentMeta').textContent=`${money(s.mt,2)} MT toplam net yük`;
  document.querySelector('#confidence').textContent=confidence+'%';

  const bufferPct=Math.max(0,Number(document.querySelector('#commercialBuffer').value)||0);
  const safeTotal=high+(extra*(bufferPct/100));
  document.querySelector('#safeTotal').textContent='$'+money(safeTotal,0);
  document.querySelector('#safeUnit').textContent='$'+money(safeTotal/basis.qty,4);
  document.querySelector('#safeUnitLabel').textContent=basis.suffix;
  document.querySelector('#safeTotalMeta').textContent=`Üst maliyet aralığı + %${money(bufferPct,1)} ticari koruma payı`;

  document.querySelector('#estimateShare').textContent=money(estimateShare,1)+'%';
  const matches=matchingQuotes();
  const risky=estimateShare>20||matches.length===0;
  document.querySelector('#commercialStatus').textContent=risky?'Doğrulama gerekli':'Daha güvenli';
  document.querySelector('#commercialStatusMeta').textContent=risky?'Teklif vermeden önce kritik kalemleri doğrula':'Gerçek teklif/veri kapsamı daha iyi';
  const riskMessage=document.querySelector('#riskMessage');
  riskMessage.className='risk-message '+(risky?'warning':'ok');
  riskMessage.textContent=risky
    ? 'Bu hesapta tahmini veri oranı veya doğrulanmış navlun verisi yetersiz. Ticari fiyat vermeden önce navlun ve kritik gümrük kalemlerini doğrulayın.'
    : 'Bu senaryoda doğrulanmış veri kapsamı daha güçlü. Yine de teklif geçerlilik tarihlerini kontrol edin.';

  document.querySelector('#breakdownText').innerHTML=`
    <span>Ürün</span><strong>$${money(goods,0)}</strong>
    <span>+</span><span>Ek maliyetler</span><strong>$${money(extra,0)}</strong>
    <span>=</span><span>Nihai toplam</span><strong>$${money(total,0)}</strong>`;
  document.querySelector('#range').textContent='$'+money(low,0)+' – $'+money(high,0);
  document.querySelector('#routeText').textContent=
    `${document.querySelector('#productName').value} · ${document.querySelector('#origin').value} → ${document.querySelector('#destination').value} · ${document.querySelector('#incoterm').value} · ${s.count} × ${document.querySelector('#containerType').value}`;
  document.querySelector('#results').hidden=false;
});

async function loadFx(){
  const button=document.querySelector('#refreshFx');
  const rateEl=document.querySelector('#fxRate');
  const metaEl=document.querySelector('#fxMeta');
  const base=document.querySelector('#fxBase').value.trim().toUpperCase();
  const quote=document.querySelector('#fxQuote').value.trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(base)||!/^[A-Z]{3}$/.test(quote)){
    rateEl.textContent='Geçersiz para birimi';metaEl.textContent='Örnek: USD, EUR, TRY';return;
  }
  button.disabled=true;button.textContent='Yükleniyor…';
  try{
    const response=await fetch(`/api/fx?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`,{cache:'no-store'});
    if(!response.ok) throw new Error();
    const data=await response.json();
    rateEl.textContent=`1 ${base} = ${money(Number(data.rate),4)} ${quote}`;
    const dateText=data.date?new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(data.date+'T12:00:00Z')):'Güncel';
    metaEl.textContent=`${dateText} · ${data.sourceName||'Referans kur'}`;
  }catch{rateEl.textContent='Kur verisi alınamadı';metaEl.textContent='API bağlantısı henüz aktif değil veya deploy tamamlanmadı.'}
  finally{button.disabled=false;button.textContent='Kuru yenile'}
}
document.querySelector('#refreshFx').addEventListener('click',loadFx);
loadFx();

async function calculateRoute(){
  const btn=document.querySelector('#calculateRoute');
  btn.disabled=true;btn.textContent='Hesaplanıyor…';document.querySelector('#routeStatus').textContent='Yükleniyor';
  try{
    const params=new URLSearchParams({
      origin:document.querySelector('#origin').value.trim(),
      destination:document.querySelector('#destination').value.trim(),
      grossWeightKg:String(Number(document.querySelector('#grossWeightKg').value)||40000),
      heightCm:String(Number(document.querySelector('#heightCm').value)||400)
    });
    const res=await fetch('/api/route?'+params.toString(),{cache:'no-store'});
    const data=await res.json();
    if(!res.ok){
      if(data.status==='NOT_CONFIGURED'){
        document.querySelector('#routeStatus').textContent='API anahtarı gerekli';
        document.querySelector('#routeDistance').textContent='—';
        document.querySelector('#routeDuration').textContent='—';
        document.querySelector('#routeTolls').textContent='—';
        return;
      }
      throw new Error();
    }
    document.querySelector('#routeDistance').textContent=money(data.distanceKm,0)+' km';
    document.querySelector('#routeDuration').textContent=money(data.durationHours,1)+' saat';
    const tollEntries=Object.entries(data.tollTotals||{});
    document.querySelector('#routeTolls').textContent=tollEntries.length
      ? tollEntries.map(([c,v])=>money(v,2)+' '+c).join(' + ')
      : (data.tollDataAvailable ? 'Yol ücreti yok / veri yok' : 'Ücretsiz kaynakta yok');
    document.querySelector('#routeStatus').textContent=data.truckProfileApplied?'Doğrulanmış kamyon rotası':'Ücretsiz rota tahmini';
  }catch{document.querySelector('#routeStatus').textContent='Rota alınamadı'}
  finally{btn.disabled=false;btn.textContent='Rotayı hesapla'}
}
document.querySelector('#calculateRoute').addEventListener('click',calculateRoute);


function buildPrintReport(){
  const s=shipment();
  const get=id=>document.querySelector(id)?.textContent?.trim()||'—';
  document.querySelector('#printDate').textContent=new Intl.DateTimeFormat('tr-TR',{dateStyle:'long',timeStyle:'short'}).format(new Date());
  document.querySelector('#printProduct').textContent=document.querySelector('#productName').value||'—';
  document.querySelector('#printHs').textContent=document.querySelector('#hsCode').value||'—';
  document.querySelector('#printOriginCountry').textContent=document.querySelector('#originCountry').value||'—';
  document.querySelector('#printIncoterm').textContent=document.querySelector('#incoterm').value||'—';
  document.querySelector('#printOrigin').textContent=document.querySelector('#origin').value||'—';
  document.querySelector('#printDestination').textContent=document.querySelector('#destination').value||'—';
  document.querySelector('#printContainer').textContent=`${s.count} × ${document.querySelector('#containerType').value}`;
  document.querySelector('#printQuantity').textContent=`${money(s.mt,2)} MT`;
  document.querySelector('#printUnitFinal').textContent=get('#unitFinal')+' '+get('#unitFinalLabel');
  document.querySelector('#printTotal').textContent=get('#total');
  document.querySelector('#printSafeTotal').textContent=get('#safeTotal');
  document.querySelector('#printConfidence').textContent=get('#confidence');
  document.querySelector('#printRange').textContent=get('#range');
  document.querySelector('#printCommercialStatus').textContent=get('#commercialStatus');

  document.querySelector('#printCostRows').innerHTML=[...document.querySelectorAll('.cost-row')].map(row=>{
    const label=row.querySelector('.label').value||'—';
    const method=row.querySelector('.method').selectedOptions[0]?.textContent||'—';
    const source=row.querySelector('.source').selectedOptions[0]?.textContent||'—';
    const amount=row.querySelector('.computed').textContent||'—';
    return `<tr><td>${label}</td><td>${method}</td><td>${source}</td><td>${amount}</td></tr>`;
  }).join('');
}

document.querySelector('#printReport').addEventListener('click',()=>{
  if(document.querySelector('#results').hidden){
    alert('Önce maliyeti hesaplayın.');
    return;
  }
  buildPrintReport();
  window.print();
});
