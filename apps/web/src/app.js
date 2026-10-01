const weights = {
  LIVE: 1,
  OFFICIAL: 0.98,
  QUOTE: 0.92,
  MARKET_AVG: 0.82,
  MANUAL: 0.75,
  ESTIMATE: 0.60
};

const spreads = {
  LIVE: 0.02,
  OFFICIAL: 0.005,
  QUOTE: 0.04,
  MARKET_AVG: 0.10,
  MANUAL: 0.08,
  ESTIMATE: 0.18
};

const sourceLabels = {
  LIVE: 'Canlı veri',
  OFFICIAL: 'Resmî kaynak',
  QUOTE: 'Güncel teklif',
  MARKET_AVG: 'Piyasa ortalaması',
  MANUAL: 'Manuel veri',
  ESTIMATE: 'Tahmin'
};

const rows = document.querySelector('#costRows');

const defaults = [
  ['Çıkış iç nakliye', 7200, 'MARKET_AVG'],
  ['İhracat gümrüğü ve belgeler', 950, 'MARKET_AVG'],
  ['Uluslararası navlun', 22500, 'MARKET_AVG'],
  ['Yük sigortası', 685, 'QUOTE'],
  ['Varış / sınır masrafları', 4800, 'ESTIMATE'],
  ['İthalat vergileri', 9783, 'OFFICIAL'],
  ['Gümrük müşavirliği', 1300, 'MARKET_AVG'],
  ['Varış iç nakliye', 6400, 'ESTIMATE']
];

function addRow([label = '', amount = 0, source = 'ESTIMATE'] = {}) {
  const div = document.createElement('div');
  div.className = 'cost-row';

  div.innerHTML = `
    <input class="label" value="${label}">
    <input class="amount" type="number" min="0" step="0.01" value="${amount}">
    <select class="source">
      ${Object.keys(weights)
        .map(key => `<option value="${key}" ${key === source ? 'selected' : ''}>${sourceLabels[key]}</option>`)
        .join('')}
    </select>
    <button type="button" title="Sil">×</button>
  `;

  div.querySelector('button').addEventListener('click', () => div.remove());
  rows.appendChild(div);
}

defaults.forEach(addRow);
document.querySelector('#addCost').addEventListener('click', () => addRow());

function money(value, digits = 2) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function parsePositiveNumber(selector) {
  const value = Number(document.querySelector(selector).value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

document.querySelector('#calculate').addEventListener('click', () => {
  const mt = parsePositiveNumber('#quantity');
  const density = parsePositiveNumber('#density');
  const price = parsePositiveNumber('#price');

  if (!mt || !density || !price) {
    alert('Miktar, yoğunluk ve alış fiyatı alanlarını kontrol edin.');
    return;
  }

  const litres = (mt * 1000) / density;
  const goods = litres * price;

  const costs = [...document.querySelectorAll('.cost-row')].map(row => ({
    amount: Math.max(0, Number(row.querySelector('.amount').value) || 0),
    source: row.querySelector('.source').value
  }));

  const extra = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const total = goods + extra;

  const low =
    goods +
    costs.reduce(
      (sum, cost) => sum + cost.amount * (1 - spreads[cost.source]),
      0
    );

  const high =
    goods +
    costs.reduce(
      (sum, cost) => sum + cost.amount * (1 + spreads[cost.source]),
      0
    );

  const confidence = Math.round(
    ((goods * 0.92) +
      costs.reduce(
        (sum, cost) => sum + cost.amount * weights[cost.source],
        0
      )) /
      total *
      100
  );

  document.querySelector('#perLitre').textContent = '$' + money(total / litres, 4);
  document.querySelector('#goodsTotal').textContent = '$' + money(goods, 0);
  document.querySelector('#extraTotal').textContent = '$' + money(extra, 0);
  document.querySelector('#total').textContent = '$' + money(total, 0);

  document.querySelector('#goodsPerLitre').textContent = '$' + money(goods / litres, 4);
  document.querySelector('#extraPerLitre').textContent = '$' + money(extra / litres, 4);
  document.querySelector('#perMt').textContent = '$' + money(total / mt, 2);
  document.querySelector('#confidence').textContent = confidence + '%';

  document.querySelector('#breakdownText').innerHTML = `
    <span>EXW ürün</span>
    <strong>$${money(goods, 0)}</strong>
    <span>+</span>
    <span>EXW sonrası ek maliyet</span>
    <strong>$${money(extra, 0)}</strong>
    <span>=</span>
    <span>Nihai toplam</span>
    <strong>$${money(total, 0)}</strong>
  `;

  document.querySelector('#range').textContent =
    '$' + money(low, 0) + ' – $' + money(high, 0);

  document.querySelector('#routeText').textContent =
    `${document.querySelector('#origin').value} → ${document.querySelector('#destination').value} · ${document.querySelector('#incoterm').value} · ${mt} MT`;

  document.querySelector('#results').hidden = false;
});

async function loadFx() {
  const button = document.querySelector('#refreshFx');
  const rateEl = document.querySelector('#fxRate');
  const metaEl = document.querySelector('#fxMeta');

  const base = document.querySelector('#fxBase').value.trim().toUpperCase();
  const quote = document.querySelector('#fxQuote').value.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) {
    rateEl.textContent = 'Geçersiz para birimi';
    metaEl.textContent = 'Örnek: USD, EUR, TRY';
    return;
  }

  button.disabled = true;
  button.textContent = 'Yükleniyor…';
  rateEl.textContent = 'Yükleniyor…';

  try {
    const response = await fetch(
      `/api/fx?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('Kur verisi alınamadı');

    const data = await response.json();

    rateEl.textContent = `1 ${base} = ${money(Number(data.rate), 4)} ${quote}`;

    const dateText = data.date
      ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' })
          .format(new Date(data.date + 'T12:00:00Z'))
      : 'Güncel';

    metaEl.textContent =
      `${dateText} · ${data.sourceName || 'Referans kur'}`;
  } catch (error) {
    rateEl.textContent = 'Kur verisi alınamadı';
    metaEl.textContent =
      'API bağlantısı henüz aktif değil veya deploy tamamlanmadı.';
  } finally {
    button.disabled = false;
    button.textContent = 'Kuru yenile';
  }
}

document.querySelector('#refreshFx').addEventListener('click', loadFx);
loadFx();
