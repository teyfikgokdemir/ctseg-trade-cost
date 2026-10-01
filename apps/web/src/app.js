const weights={LIVE:1,OFFICIAL:.98,QUOTE:.92,MARKET_AVG:.82,MANUAL:.75,ESTIMATE:.60};
const spreads={LIVE:.02,OFFICIAL:.005,QUOTE:.04,MARKET_AVG:.10,MANUAL:.08,ESTIMATE:.18};

const sourceLabels={
  LIVE:'Canlı veri',
  OFFICIAL:'Resmî kaynak',
  QUOTE:'Güncel teklif',
  MARKET_AVG:'Piyasa ortalaması',
  MANUAL:'Manuel veri',
  ESTIMATE:'Tahmin'
};

const methodLabels={
  FIXED:'Sevkiyat başına',
  PER_CONTAINER:'Konteyner başına',
  PER_MT:'MT başına',
  PCT_GOODS:'Ürün bedelinin %',
  PCT_CUSTOMS:'Gümrük kıymetinin %'
};

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

function money(n,d=2){
  return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
}

function positive(selector){
  const v=Number(document.querySelector(selector).value);
  return Number.isFinite(v)&&v>0?v:null;
}

function shipment(){
  const count=positive('#containerCount')||0;
  const payload=positive('#payloadPerContainer')||0;
  const mt=count*payload;
  return {count,payload,mt,kg:mt*1000,litres:mt*1000};
}

function syncShipment(){
  document.querySelector('#totalMt').value=shipment().mt.toFixed(2);
  refreshCalculatedAmounts();
}

document.querySelector('#containerCount').addEventListener('input',syncShipment);
document.querySelector('#payloadPerContainer').addEventListener('input',syncShipment);

function purchaseBasis(){
  const s=shipment();
  const unit=document.querySelector('#priceUnit').value;
  if(unit==='USD_L') return {qty:s.litres,label:'litre',suffix:'USD / litre'};
  if(unit==='USD_KG') return {qty:s.kg,label:'kg',suffix:'USD / kg'};
  return {qty:s.mt,label:'MT',suffix:'USD / MT'};
}

function goodsTotal(){
  const p=positive('#price')||0;
  return purchaseBasis().qty*p;
}

function customsBase(){
  const goods=goodsTotal();
  const freight=[...document.querySelectorAll('.cost-row')]
    .filter(r=>r.querySelector('.method').value==='PER_CONTAINER' && /navlun|freight|nakliye/i.test(r.querySelector('.label').value))
    .reduce((sum,r)=>sum+calculateRow(r,{excludeCustoms:true}),0);
  const insurance=[...document.querySelectorAll('.cost-row')]
    .filter(r=>/sigorta|insurance/i.test(r.querySelector('.label').value))
    .reduce((sum,r)=>sum+calculateRow(r,{excludeCustoms:true}),0);
  return goods+freight+insurance;
}

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

function addRow([label='',method='FIXED',rate=0,source='ESTIMATE']={}){
  const div=document.createElement('div');
  div.className='cost-row';
  div.innerHTML=`
    <input class="label" value="${label}">
    <select class="method">
      ${Object.keys(methodLabels).map(k=>`<option value="${k}" ${k===method?'selected':''}>${methodLabels[k]}</option>`).join('')}
    </select>
    <input class="rate" type="number" min="0" step="0.01" value="${rate}">
    <select class="source">
      ${Object.keys(sourceLabels).map(k=>`<option value="${k}" ${k===source?'selected':''}>${sourceLabels[k]}</option>`).join('')}
    </select>
    <output class="computed">$0</output>
    <button type="button" title="Sil">×</button>
  `;
  div.querySelector('button').addEventListener('click',()=>{div.remove();refreshCalculatedAmounts();});
  div.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',refreshCalculatedAmounts));
  rows.appendChild(div);
  refreshCalculatedAmounts();
}

defaults.forEach(addRow);
document.querySelector('#addCost').addEventListener('click',()=>addRow());

function refreshCalculatedAmounts(){
  [...document.querySelectorAll('.cost-row')].forEach(row=>{
    row.querySelector('.computed').textContent='$'+money(calculateRow(row),0);
  });
}

['price','priceUnit'].forEach(id=>document.querySelector('#'+id).addEventListener('input',refreshCalculatedAmounts));
syncShipment();

document.querySelector('#calculate').addEventListener('click',()=>{
  const s=shipment();
  const price=positive('#price');
  if(!s.count||!s.payload||!price){
    alert('Konteyner sayısı, net yük ve alış fiyatını kontrol edin.');
    return;
  }

  const goods=goodsTotal();
  const costRows=[...document.querySelectorAll('.cost-row')];
  const costs=costRows.map(row=>({
    amount:calculateRow(row),
    source:row.querySelector('.source').value
  }));
  const extra=costs.reduce((sum,c)=>sum+c.amount,0);
  const total=goods+extra;

  const low=goods+costs.reduce((sum,c)=>sum+c.amount*(1-spreads[c.source]),0);
  const high=goods+costs.reduce((sum,c)=>sum+c.amount*(1+spreads[c.source]),0);
  const confidence=Math.round(((goods*.92)+costs.reduce((sum,c)=>sum+c.amount*weights[c.source],0))/total*100);

  const basis=purchaseBasis();
  const finalUnit=total/basis.qty;
  const extraUnit=extra/basis.qty;
  const goodsUnit=goods/basis.qty;

  document.querySelector('#unitFinal').textContent='$'+money(finalUnit,4);
  document.querySelector('#unitFinalLabel').textContent=basis.suffix;
  document.querySelector('#goodsTotal').textContent='$'+money(goods,0);
  document.querySelector('#extraTotal').textContent='$'+money(extra,0);
  document.querySelector('#total').textContent='$'+money(total,0);

  document.querySelector('#goodsUnit').textContent='$'+money(goodsUnit,4);
  document.querySelector('#goodsUnitLabel').textContent=basis.suffix;
  document.querySelector('#extraUnit').textContent='$'+money(extraUnit,4);
  document.querySelector('#extraUnitLabel').textContent=basis.suffix;

  document.querySelector('#shipmentSummary').textContent=`${s.count} × ${document.querySelector('#containerType').value}`;
  document.querySelector('#shipmentMeta').textContent=`${money(s.mt,2)} MT toplam net yük`;
  document.querySelector('#confidence').textContent=confidence+'%';

  document.querySelector('#breakdownText').innerHTML=`
    <span>Ürün</span><strong>$${money(goods,0)}</strong>
    <span>+</span>
    <span>Ek maliyetler</span><strong>$${money(extra,0)}</strong>
    <span>=</span>
    <span>Nihai toplam</span><strong>$${money(total,0)}</strong>
  `;

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
    rateEl.textContent='Geçersiz para birimi';
    metaEl.textContent='Örnek: USD, EUR, TRY';
    return;
  }

  button.disabled=true;
  button.textContent='Yükleniyor…';
  try{
    const response=await fetch(`/api/fx?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`,{cache:'no-store'});
    if(!response.ok) throw new Error('Kur verisi alınamadı');
    const data=await response.json();
    rateEl.textContent=`1 ${base} = ${money(Number(data.rate),4)} ${quote}`;
    const dateText=data.date
      ? new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(data.date+'T12:00:00Z'))
      : 'Güncel';
    metaEl.textContent=`${dateText} · ${data.sourceName||'Referans kur'}`;
  }catch{
    rateEl.textContent='Kur verisi alınamadı';
    metaEl.textContent='API bağlantısı henüz aktif değil veya deploy tamamlanmadı.';
  }finally{
    button.disabled=false;
    button.textContent='Kuru yenile';
  }
}

document.querySelector('#refreshFx').addEventListener('click',loadFx);
loadFx();
