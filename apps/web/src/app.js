const weights={LIVE:1,OFFICIAL:.98,QUOTE:.92,MARKET_AVG:.82,MANUAL:.75,ESTIMATE:.6};
const spreads={LIVE:.02,OFFICIAL:.005,QUOTE:.04,MARKET_AVG:.10,MANUAL:.08,ESTIMATE:.18};
const sourceLabels={
 LIVE:'Canlı veri',
 OFFICIAL:'Resmî kaynak',
 QUOTE:'Güncel teklif',
 MARKET_AVG:'Piyasa ortalaması',
 MANUAL:'Manuel veri',
 ESTIMATE:'Tahmin'
};
const rows=document.querySelector('#costRows');
const defaults=[
 ['Çıkış iç nakliye',7200,'MARKET_AVG'],
 ['İhracat gümrüğü ve belgeler',950,'MARKET_AVG'],
 ['Uluslararası navlun',22500,'MARKET_AVG'],
 ['Yük sigortası',685,'QUOTE'],
 ['Varış / sınır masrafları',4800,'ESTIMATE'],
 ['İthalat vergileri',9783,'OFFICIAL'],
 ['Gümrük müşavirliği',1300,'MARKET_AVG'],
 ['Varış iç nakliye',6400,'ESTIMATE']
];

function addRow([label='',amount=0,source='ESTIMATE']={}){
 const div=document.createElement('div'); div.className='cost-row';
 div.innerHTML=`<input class="label" value="${label}"><input class="amount" type="number" step="0.01" value="${amount}"><select class="source">${Object.keys(weights).map(s=>`<option value="${s}" ${s===source?'selected':''}>${sourceLabels[s]}</option>`).join('')}</select><button title="Sil">×</button>`;
 div.querySelector('button').onclick=()=>div.remove();
 rows.appendChild(div);
}
defaults.forEach(addRow);
document.querySelector('#addCost').onclick=()=>addRow();

function money(n,d=2){
 return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
}

document.querySelector('#calculate').onclick=()=>{
 const mt=+document.querySelector('#quantity').value;
 const density=+document.querySelector('#density').value;
 const price=+document.querySelector('#price').value;
 const litres=mt*1000/density;
 const goods=litres*price;
 const costs=[...document.querySelectorAll('.cost-row')].map(r=>({
   amount:+r.querySelector('.amount').value||0,
   source:r.querySelector('.source').value
 }));
 const total=goods+costs.reduce((s,c)=>s+c.amount,0);
 const low=goods+costs.reduce((s,c)=>s+c.amount*(1-spreads[c.source]),0);
 const high=goods+costs.reduce((s,c)=>s+c.amount*(1+spreads[c.source]),0);
 const conf=Math.round((goods*.92+costs.reduce((s,c)=>s+c.amount*weights[c.source],0))/total*100);

 document.querySelector('#perLitre').textContent='$'+money(total/litres,4);
 document.querySelector('#total').textContent='$'+money(total,0);
 document.querySelector('#perMt').textContent='$'+money(total/mt,2);
 document.querySelector('#confidence').textContent=conf+'%';
 document.querySelector('#range').textContent='$'+money(low,0)+' – $'+money(high,0);
 document.querySelector('#routeText').textContent=`${document.querySelector('#origin').value} → ${document.querySelector('#destination').value} · ${document.querySelector('#incoterm').value} · ${mt} MT`;
 document.querySelector('#results').hidden=false;
};

async function loadFx(){
 const btn=document.querySelector('#refreshFx');
 const rateEl=document.querySelector('#fxRate');
 const metaEl=document.querySelector('#fxMeta');
 const base=document.querySelector('#fxBase').value.trim().toUpperCase();
 const quote=document.querySelector('#fxQuote').value.trim().toUpperCase();
 btn.disabled=true;
 btn.textContent='Yükleniyor…';
 try{
   const res=await fetch(`/api/fx?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`);
   if(!res.ok) throw new Error('Kur verisi alınamadı');
   const data=await res.json();
   rateEl.textContent=`1 ${base} = ${money(data.rate,4)} ${quote}`;
   const date=data.date ? new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium'}).format(new Date(data.date+'T12:00:00Z')) : 'güncel';
   metaEl.textContent=`${date} · ${data.sourceName || 'referans veri'}`;
 }catch(error){
   rateEl.textContent='Veri alınamadı';
   metaEl.textContent='Cloudflare Function deploy edildikten sonra otomatik çalışacaktır.';
 }finally{
   btn.disabled=false;
   btn.textContent='Kuru yenile';
 }
}
document.querySelector('#refreshFx').onclick=loadFx;
loadFx();
