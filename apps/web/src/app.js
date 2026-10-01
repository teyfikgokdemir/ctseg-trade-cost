const weights={LIVE:1,OFFICIAL:.98,QUOTE:.92,MARKET_AVG:.82,MANUAL:.75,ESTIMATE:.6};
const spreads={LIVE:.02,OFFICIAL:.005,QUOTE:.04,MARKET_AVG:.10,MANUAL:.08,ESTIMATE:.18};
const rows=document.querySelector('#costRows');
const defaults=[
 ['Origin inland haulage',7200,'MARKET_AVG'],['Export customs & docs',950,'MARKET_AVG'],
 ['International freight',22500,'MARKET_AVG'],['Cargo insurance',685,'QUOTE'],
 ['Destination/border handling',4800,'ESTIMATE'],['Import duty & taxes',9783,'OFFICIAL'],
 ['Customs broker',1300,'MARKET_AVG'],['Destination inland haulage',6400,'ESTIMATE']
];
function addRow([label='',amount=0,source='ESTIMATE']={}){
 const div=document.createElement('div');div.className='cost-row';
 div.innerHTML=`<input class="label" value="${label}"><input class="amount" type="number" step="0.01" value="${amount}"><select class="source">${Object.keys(weights).map(s=>`<option ${s===source?'selected':''}>${s}</option>`).join('')}</select><button title="Remove">×</button>`;
 div.querySelector('button').onclick=()=>div.remove();rows.appendChild(div);
}
defaults.forEach(addRow);document.querySelector('#addCost').onclick=()=>addRow();
function money(n,d=2){return new Intl.NumberFormat('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n)}
document.querySelector('#calculate').onclick=()=>{
 const mt=+document.querySelector('#quantity').value,density=+document.querySelector('#density').value,price=+document.querySelector('#price').value;
 const litres=mt*1000/density,goods=litres*price;
 const costs=[...document.querySelectorAll('.cost-row')].map(r=>({amount:+r.querySelector('.amount').value||0,source:r.querySelector('.source').value}));
 const total=goods+costs.reduce((s,c)=>s+c.amount,0);
 const low=goods+costs.reduce((s,c)=>s+c.amount*(1-spreads[c.source]),0),high=goods+costs.reduce((s,c)=>s+c.amount*(1+spreads[c.source]),0);
 const conf=Math.round((goods*.92+costs.reduce((s,c)=>s+c.amount*weights[c.source],0))/total*100);
 document.querySelector('#perLitre').textContent='$'+money(total/litres,4);
 document.querySelector('#total').textContent='$'+money(total,0);
 document.querySelector('#perMt').textContent='$'+money(total/mt,2);
 document.querySelector('#confidence').textContent=conf+'%';
 document.querySelector('#range').textContent='$'+money(low,0)+' – $'+money(high,0);
 document.querySelector('#routeText').textContent=`${document.querySelector('#origin').value} → ${document.querySelector('#destination').value} · ${document.querySelector('#incoterm').value} · ${mt} MT`;
 document.querySelector('#results').hidden=false;
};
