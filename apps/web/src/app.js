const languageStoreKey='ctseg_trade_cost_language_v1';
let currentLanguage=localStorage.getItem(languageStoreKey)==='en'?'en':'tr';

const STATIC_TRANSLATIONS={
  'ULUSLARARASI TİCARET MALİYET ZEKÂSI':'INTERNATIONAL TRADE COST INTELLIGENCE',
  'Toplam Teslim Maliyeti':'Total Landed Cost',
  'Konteyner, ürün, rota ve ülke bazında ithalat / ihracat maliyet motoru.':'Import / export cost engine by container, product, route and country.',
  'Dil':'Language',
  'Sevkiyat ve ürün':'Shipment and product',
  'Nakliye taşıma modu ve ekipman bazlı; ürün ve vergi hesapları kendi gerçek matrahına göre çalışır.':'Freight is modeled by transport mode and equipment; product and tax calculations use their actual tax bases.',
  'Ürün':'Product',
  'HS Code':'HS Code',
  'Üründen ara':'Search by product',
  'HS 2022 global sınıflandırma':'HS 2022 global classification',
  'Menşe ülke':'Country of origin',
  'İhracat ülkesi':'Export country',
  'Transit ülkeler':'Transit countries',
  'Çıkış noktası':'Origin point',
  'Teslim noktası':'Delivery point',
  'İthalat ülkesi':'Import country',
  'Taşıma modu':'Transport mode',
  'Taşıma ekipmanı':'Transport equipment',
  'Ekipman sayısı':'Equipment count',
  'Net yük / ekipman (MT)':'Net payload / equipment (MT)',
  'Denizyolu':'Sea',
  'Karayolu':'Road',
  'Demiryolu':'Rail',
  'Havayolu':'Air',
  'Multimodal':'Multimodal',
  '20 ft konteyner':'20 ft container',
  '40 ft konteyner':'40 ft container',
  'Kamyon / TIR':'Truck',
  'Demiryolu vagonu':'Rail wagon',
  'Hava kargo birimi':'Air cargo unit',
  'Diğer':'Other',
  'Toplam net miktar (MT)':'Total net quantity (MT)',
  'Alış fiyatı':'Purchase price',
  'Fiyat birimi':'Price unit',
  'Gümrük kıymeti doğrulama':'Customs valuation verification',
  'Transaction value üzerine yalnız doğrulanmış ekleme/indirimleri uygulayın. Hedef ülkenin valuation kuralı doğrulanmadan final duty hesaplanmaz.':'Apply only verified additions/deductions to the transaction value. Final duty is not calculated until the destination-country valuation rule is verified.',
  'Transaction value (USD)':'Transaction value (USD)',
  'Doğrulama durumu':'Verification status',
  'Çalışma değeri':'Working value',
  'Doğrulandı':'Verified',
  'Gümrük kıymeti (USD)':'Customs value (USD)',
  'Sınıra kadar navlun ekle':'Add freight to border',
  'Sınıra kadar sigorta ekle':'Add insurance to border',
  'Ambalaj / packing ekle':'Add packing',
  'Assists ekle':'Add assists',
  'Royalty / lisans ekle':'Add royalty / licence fees',
  'Satış komisyonu ekle':'Add selling commission',
  'Diğer ekleme':'Other addition',
  'İthalat sonrası taşıma indir':'Deduct post-import transport',
  'Diğer indirim':'Other deduction',
  'Bu alan çalışma değeridir. Hangi kalemin eklenip indirileceği hedef ülke kurallarına göre doğrulanmalıdır.':'This is a working value. Whether each item is includable or deductible must be verified under the destination-country rules.',
  'Gümrük ve tarife doğrulama':'Customs and tariff verification',
  'HS6, menşe ve ithalat ülkesine göre WTO resmi tarife verisi otomatik sorgulanır.':'Official WTO tariff data is queried automatically by HS6, origin and import country.',
  'Tarifeyi yenile':'Refresh tariff',
  'MFN oranı':'MFN rate',
  'Kaynak yılı':'Source year',
  'Durum':'Status',
  'Bekliyor':'Waiting',
  'HS kodu ve ülkeler seçildiğinde otomatik sorgulanır.':'Queried automatically when the HS code and countries are selected.',
  'Preferential / FTA doğrulama':'Preferential / FTA verification',
  'WTO preferential verisi yalnız adaydır; uygunluk ve uygulanabilir oran ayrıca doğrulanmalıdır.':'WTO preferential data is candidate evidence only; eligibility and the executable rate must be verified separately.',
  'Aday preferential oran':'Preferential candidate rate',
  'Uygunluk':'Eligibility',
  'Doğrulanmadı':'Not confirmed',
  'Uygun değil':'Not eligible',
  'Uygun':'Eligible',
  'Doğrulanmış preferential oran (%)':'Verified preferential rate (%)',
  'Scheme / belge referansı':'Scheme / evidence reference',
  'Uygunluk doğrulanana kadar MFN güvenli varsayılan olarak kalır.':'MFN remains the safe default until preferential eligibility is verified.',
  'Ticaret önlemleri / ek gümrük yükleri':'Trade remedies / additional duties',
  'Anti-damping, countervailing, safeguard ve benzeri ek yükler standart gümrük vergisinden ayrı doğrulanır. Oran ve referans olmadan uygulanmaz.':'Anti-dumping, countervailing, safeguard and similar measures are verified separately from standard customs duty. They are never applied without a verified rate and reference.',
  'Önlem türü':'Measure type',
  'Anti-damping':'Anti-dumping',
  'Diğer ticaret önlemi':'Other trade remedy',
  'Hesaplama temeli':'Calculation basis',
  'Gümrük kıymetinin %':'% of customs value',
  'Ürün bedelinin %':'% of goods value',
  'MT başına':'Per MT',
  'Sabit tutar':'Fixed amount',
  'Doğrulanmış oran / tutar':'Verified rate / amount',
  'Resmî karar / dava / belge referansı':'Official decision / case / document reference',
  'Resmî kaynakları kontrol et':'Check official sources',
  'Doğrulanmış önlemi ekle':'Add verified measure',
  'HS, menşe ve ithalat ülkesi değişirse mevcut remedy satırları yeniden doğrulanmalıdır.':'Existing remedy rows must be re-verified if HS, origin or import country changes.',
  'İthalat vergileri':'Import taxes',
  'Hedef ülkeye göre vergi desteğini gösterir. Sistem doğrulanmamış vergi oranını otomatik kullanmaz.':'Shows tax support for the destination country. The system never applies an unverified tax rate automatically.',
  'Vergi bilgisini yenile':'Refresh tax information',
  'Ülke':'Country',
  'Vergi desteği':'Tax support',
  'Vergi kapsamı':'Tax coverage',
  'Oran durumu':'Rate status',
  'Doğrulanmış ithalat KDV / GST oranı (%)':'Verified import VAT / GST rate (%)',
  'Vergi kaynağı':'Tax source',
  'Vergi türü':'Tax type',
  'Resmî kaynak':'Official source',
  'Canlı veri':'Live data',
  'Manuel doğrulama':'Manual verification',
  'KDV / GST':'VAT / GST',
  'ÖTV / Excise':'Excise',
  'Ek vergi / Surcharge':'Surcharge / additional tax',
  'Gümrük işlem ücreti':'Customs processing fee',
  'Diğer ithalat vergisi':'Other import tax',
  'KDV / GST oranını uygula':'Apply VAT / GST rate',
  'Ek ithalat vergisi ekle':'Add import tax',
  'İthalat ülkesi seçildiğinde vergi desteği kontrol edilir.':'Tax support is checked when the import country is selected.',
  'Rota ve taşıma doğrulama':'Route and transport verification',
  'Gerçek rota sağlayıcısı bağlandığında mesafe, sürüş süresi ve mevcut yol ücretleri burada doğrulanır.':'Distance, driving time and available tolls are verified here when a live route provider is connected.',
  'Rotayı hesapla':'Calculate route',
  'Araç brüt ağırlığı (kg)':'Vehicle gross weight (kg)',
  'Araç yüksekliği (cm)':'Vehicle height (cm)',
  'Ticari koruma payı (%)':'Commercial safety buffer (%)',
  'Mesafe':'Distance',
  'Sürüş süresi':'Driving time',
  'Yol ücretleri':'Tolls',
  'Rota verisi':'Route data',
  'Navlun benchmark':'Freight benchmark',
  'Aynı rota ve ekipman için gerçek teklifler ile mevcut benchmark verilerini birleştirir. Veri yoksa fiyat üretmez.':'Combines real quotes and available benchmark data for the same route and equipment. It does not invent a price when no evidence exists.',
  'Benchmark yenile':'Refresh benchmark',
  'Beklenen / birim':'Expected / unit',
  'Beklenen aralık':'Expected range',
  'Güven':'Confidence',
  'Kaynaklar':'Sources',
  'Önce rotayı hesaplayın veya aynı rota için forwarder teklifi kaydedin.':'Calculate the route first or save a forwarder quote for the same route.',
  'Güncel döviz kuru':'Current exchange rate',
  'Kuru yenile':'Refresh rate',
  'Kaynak para birimi':'Base currency',
  'Hedef para birimi':'Quote currency',
  'Referans kur':'Reference rate',
  'Henüz yüklenmedi':'Not loaded yet',
  'Forwarder teklif havuzu':'Forwarder quote pool',
  'Gerçek teklifleri kaydet. Sistem aynı rota ve konteyner tipindeki geçerli tekliflerden güncel değer üretir.':'Save real quotes. The system derives a current value from valid quotes for the same route and container type.',
  'Uygun navlunu uygula':'Apply matching freight',
  'Firma / forwarder':'Company / forwarder',
  'USD / ekipman':'USD / equipment',
  'Teklif tarihi':'Quote date',
  'Geçerlilik sonu':'Valid until',
  'Teklifi kaydet':'Save quote',
  'Eşleşen teklif':'Matching quotes',
  'Güncel ortalama':'Current average',
  'Son teklif':'Latest quote',
  'Veri durumu':'Data status',
  'Veri yok':'No data',
  'Maliyet kalemleri':'Cost items',
  'Tüm sonuçlar USD olarak normalize edilir. Hesaplama yöntemi her kaleme ayrı uygulanır.':'All results are normalized to USD. Each cost item uses its own calculation method.',
  '+ Maliyet ekle':'+ Add cost',
  'Açıklama':'Description',
  'Yöntem':'Method',
  'Birim değer':'Unit value',
  'Kaynak':'Source',
  'Hesaplanan':'Calculated',
  'Toplam teslim maliyetini hesapla':'Calculate total landed cost',
  'Nihai birim maliyet':'Final unit cost',
  'Tedarikçi fiyat değeri':'Supplier price value',
  'USD · seçilen Incoterm fiyat kapsamı':'USD · selected Incoterm price scope',
  'Ek landed-cost':'Additional landed cost',
  'USD · tedarikçi fiyatına dahil olmayan maliyetler':'USD · costs not included in the supplier price',
  'Nihai toplam maliyet':'Final total cost',
  'USD · ürün + tüm ek maliyetler':'USD · product + all additional costs',
  'Ürün birim fiyatı':'Product unit price',
  'Ek maliyet / birim':'Additional cost / unit',
  'Toplam sevkiyat':'Total shipment',
  'Veri güveni':'Data confidence',
  'hesap güven seviyesi':'calculation confidence level',
  'Koruma paylı toplam maliyet':'Buffered total cost',
  'Belirsizlik + ticari koruma payı':'Uncertainty + commercial safety buffer',
  'Koruma paylı birim maliyet':'Buffered unit cost',
  'Tahmini gider oranı':'Estimated-cost share',
  'Toplam ek maliyet içindeki tahmini veri':'Estimated data within additional costs',
  'Ticari durum':'Commercial status',
  'Beklenen maliyet aralığı':'Expected cost range',
  'PDF / Yazdır':'PDF / Print',
  'Geçmiş hesaplamalar':'Calculation history',
  "D1 üzerinde saklanan son hesaplamaları görüntüleyin. Geçmiş sonuçlar snapshot'tır; yeniden yüklediğinizde güncel veri kaynakları tekrar sorgulanır.":'View recent calculations stored in D1. Historical results are snapshots; current data sources are queried again when you reload them.',
  'Geçmişi yenile':'Refresh history',
  'Tüm geçmişi sil':'Delete all history',
  'Geçmiş hesaplamalar yükleniyor…':'Loading calculation history…',
  'ULUSLARARASI TİCARET MALİYET RAPORU':'INTERNATIONAL TRADE COST REPORT',
  'Menşe':'Origin',
  'Çıkış':'Origin point',
  'Teslim':'Delivery',
  'Konteyner':'Container',
  'Toplam miktar':'Total quantity',
  'Koruma paylı toplam':'Buffered total',
  'Maliyet dökümü':'Cost breakdown',
  'Kalem':'Item',
  'Tutar':'Amount',
  'Bu rapor hesaplama tarihinde mevcut olan veri, teklif ve kullanıcı girdilerine dayanır. Tahmini ve piyasa ortalaması niteliğindeki kalemler kesin teklif veya resmî tarife yerine geçmez.':'This report is based on data, quotes and user inputs available on the calculation date. Estimated and market-average items do not replace binding quotes or official tariff determinations.',
  'Veri politikası':'Data policy',
  'Navlun konteyner/araç bazlı; gümrük ve vergi kalemleri HS Code, menşe, hedef ülke ve ilgili matrah üzerinden hesaplanır. Gerçek teklifler ve resmî veriler tahminlerin önüne geçer.':'Freight is container/vehicle based; customs and tax items are calculated from HS Code, origin, destination country and the relevant tax base. Real quotes and official data take precedence over estimates.',
  'Ülke seçin':'Select country',
  'Ülkeler yükleniyor…':'Loading countries…',
  'Ülke listesi alınamadı':'Country list unavailable',
  '20 ft':'20 ft',
  '40 ft':'40 ft'
};

const STATIC_REVERSE_EN=new Map(Object.entries(STATIC_TRANSLATIONS).map(([tr,en])=>[en,tr]));

const UI_MESSAGES={
  tr:{
    hsGlobal:'HS 2022 global sınıflandırma',
    hsSearching:'HS adayları aranıyor…',
    hsNoMatch:'HS6 adayı bulunamadı',
    hsNoMatchLong:'Eşleşen HS6 adayı bulunamadı.',
    hsDataError:'HS verisi alınamadı · tekrar deneyin',
    hsSixDigits:'6 haneli HS kodu seçin veya ürün adıyla arayın',
    hsValidating:'HS kodu doğrulanıyor…',
    hsInvalid:'HS kodu doğrulanamadı',
    productFirst:'Önce ürün adını yazın',
    productMatch:'Ürün eşleşmesi',
    tariffMissing:'Eksik seçim',
    tariffMissingNote:'6 haneli HS kodu, menşe ve ithalat ülkesi gerekli.',
    tariffLoading:'Sorgulanıyor…',
    tariffNoData:'Veri alınamadı',
    tariffNoDataNote:'WTO tarife verisi alınamadı; manuel doğrulama gerekli.',
    highConfidence:'Yüksek güven',
    mediumConfidence:'Orta güven',
    verifyRequired:'Ulusal tarife doğrulaması gerekli',
    tariffNoResolvedRate:'Veri yok',
    tariffNoResolvedNote:'WTO bu HS6/ülke kombinasyonu için kullanılabilir bir MFN observation döndürmedi. Ulusal tarife satırı manuel doğrulanmalıdır.',
    tariffMfn:'WTO MFN oranı otomatik uygulandı. Nihai beyan öncesi ulusal tarife satırı doğrulanmalıdır.',
    countriesLoading:'Ülkeler yükleniyor…',
    countrySelect:'Ülke seçin',
    taxRuleConfigured:'Model hazır',
    taxRuleManual:'Manuel doğrulama',
    taxRuleLoading:'Kontrol ediliyor…',
    taxRuleMissing:'Ülke seçin',
    taxRuleVerifiedOnly:'Doğrulanmış oran gerekli',
    taxRuleProductVerify:'Ürün oranı doğrulanmalı',
    taxRuleUnavailable:'Kural profili alınamadı'
  },
  en:{
    hsGlobal:'HS 2022 global classification',
    hsSearching:'Searching HS candidates…',
    hsNoMatch:'No HS6 candidate found',
    hsNoMatchLong:'No matching HS6 candidate found.',
    hsDataError:'HS data unavailable · try again',
    hsSixDigits:'Select a 6-digit HS code or search by product name',
    hsValidating:'Validating HS code…',
    hsInvalid:'HS code could not be validated',
    productFirst:'Enter a product name first',
    productMatch:'Product match',
    tariffMissing:'Incomplete selection',
    tariffMissingNote:'A 6-digit HS code, origin and import country are required.',
    tariffLoading:'Querying…',
    tariffNoData:'Data unavailable',
    tariffNoDataNote:'WTO tariff data could not be retrieved; manual verification is required.',
    highConfidence:'High confidence',
    mediumConfidence:'Medium confidence',
    verifyRequired:'National tariff verification required',
    tariffNoResolvedRate:'No data',
    tariffNoResolvedNote:'WTO returned no usable MFN observation for this HS6/country combination. Verify the national tariff line manually.',
    tariffMfn:'The WTO MFN rate was applied automatically. Verify the national tariff line before the final declaration.',
    countriesLoading:'Loading countries…',
    countrySelect:'Select country',
    taxRuleConfigured:'Model ready',
    taxRuleManual:'Manual verification',
    taxRuleLoading:'Checking…',
    taxRuleMissing:'Select country',
    taxRuleVerifiedOnly:'Verified rate required',
    taxRuleProductVerify:'Product rate must be verified',
    taxRuleUnavailable:'Rule profile unavailable'
  }
};

const CURRENCY_NAMES={
  tr:{
    USD:'ABD Doları',EUR:'Euro',TRY:'Türk Lirası',GBP:'İngiliz Sterlini',CHF:'İsviçre Frangı',
    JPY:'Japon Yeni',CAD:'Kanada Doları',AUD:'Avustralya Doları',NZD:'Yeni Zelanda Doları',
    SEK:'İsveç Kronu',NOK:'Norveç Kronu',DKK:'Danimarka Kronu',PLN:'Polonya Zlotisi',
    CZK:'Çek Korunası',HUF:'Macar Forinti',RON:'Rumen Leyi',BGN:'Bulgar Levası',
    CNY:'Çin Yuanı',HKD:'Hong Kong Doları',SGD:'Singapur Doları',KRW:'Güney Kore Wonu',
    INR:'Hindistan Rupisi',IDR:'Endonezya Rupisi',MYR:'Malezya Ringgiti',THB:'Tayland Bahtı',
    PHP:'Filipin Pesosu',MXN:'Meksika Pesosu',BRL:'Brezilya Reali',ZAR:'Güney Afrika Randı',
    ILS:'İsrail Şekeli',ISK:'İzlanda Kronası'
  },
  en:{
    USD:'US Dollar',EUR:'Euro',TRY:'Turkish Lira',GBP:'British Pound',CHF:'Swiss Franc',
    JPY:'Japanese Yen',CAD:'Canadian Dollar',AUD:'Australian Dollar',NZD:'New Zealand Dollar',
    SEK:'Swedish Krona',NOK:'Norwegian Krone',DKK:'Danish Krone',PLN:'Polish Zloty',
    CZK:'Czech Koruna',HUF:'Hungarian Forint',RON:'Romanian Leu',BGN:'Bulgarian Lev',
    CNY:'Chinese Yuan',HKD:'Hong Kong Dollar',SGD:'Singapore Dollar',KRW:'South Korean Won',
    INR:'Indian Rupee',IDR:'Indonesian Rupiah',MYR:'Malaysian Ringgit',THB:'Thai Baht',
    PHP:'Philippine Peso',MXN:'Mexican Peso',BRL:'Brazilian Real',ZAR:'South African Rand',
    ILS:'Israeli Shekel',ISK:'Icelandic Krona'
  }
};

function updateCurrencyLanguage(){
  for(const id of ['fxBase','fxQuote']){
    const select=document.querySelector('#'+id);
    if(!select) continue;
    for(const option of select.options){
      const code=option.value;
      const name=CURRENCY_NAMES[currentLanguage]?.[code];
      if(name) option.textContent=`${code} — ${name}`;
    }
  }
}

const COST_LABEL_TRANSLATIONS={
  'Çıkış iç nakliye':'Origin inland haulage',
  'İhracat gümrüğü ve belgeler':'Export customs & documents',
  'Uluslararası navlun':'International freight',
  'Yük sigortası':'Cargo insurance',
  'Varış / sınır masrafları':'Destination / border charges',
  'İthalat gümrük vergisi (doğrulanacak)':'Import duty (to be verified)',
  'İthalat gümrük vergisi':'Import duty',
  'İthalat KDV / yerel vergi (doğrulanacak)':'Import VAT / local tax (to be verified)',
  'İthalat KDV / yerel vergi':'Import VAT / local tax',
  'Gümrük müşavirliği':'Customs brokerage',
  'Varış iç nakliye':'Destination inland haulage'
};
const COST_LABEL_REVERSE=new Map(Object.entries(COST_LABEL_TRANSLATIONS).map(([tr,en])=>[en,tr]));

function msg(key){return UI_MESSAGES[currentLanguage]?.[key]||UI_MESSAGES.tr[key]||key}

function translateStaticDocument(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const node of nodes){
    const raw=node.nodeValue;
    const text=raw.trim();
    if(!text) continue;
    const key=STATIC_TRANSLATIONS[text]?text:STATIC_REVERSE_EN.get(text);
    if(!key) continue;
    const translated=currentLanguage==='en'?STATIC_TRANSLATIONS[key]:key;
    node.nodeValue=raw.replace(text,translated);
  }

  const placeholders={
    productName:{tr:'Ürün adı veya ticari tanım',en:'Product name or commercial description'},
    hsCode:{tr:'Kod veya ürün adı yazın…',en:'Type HS code or product name…'},
    quoteProvider:{tr:'Örn. ABC Lojistik',en:'e.g. ABC Logistics'},
    origin:{tr:'Şehir, liman, depo veya sınır kapısı',en:'City, port, warehouse or border crossing'},
    destination:{tr:'Şehir, liman, depo veya adres',en:'City, port, warehouse or address'},
    transitCountries:{tr:'Opsiyonel · ISO2 kodları, örn. GE,AZ',en:'Optional · ISO2 codes, e.g. GE,AZ'}
  };
  for(const [id,values] of Object.entries(placeholders)){
    const el=document.querySelector('#'+id);
    if(!el) continue;
    el.placeholder=values[currentLanguage];
  }

  document.documentElement.lang=currentLanguage;
  document.title=currentLanguage==='en'?'International Trade Cost Calculator':'Uluslararası Ticaret Maliyet Hesaplama';
}

function updateCostLanguage(){
  document.querySelectorAll('.cost-row').forEach(row=>{
    const input=row.querySelector('.label');
    const value=input.value;
    const tr=COST_LABEL_TRANSLATIONS[value]?value:COST_LABEL_REVERSE.get(value);
    if(tr) input.value=currentLanguage==='en'?COST_LABEL_TRANSLATIONS[tr]:tr;

    const method=row.querySelector('.method');
    [...method.options].forEach(option=>{
      option.textContent=(currentLanguage==='en'?methodLabelsEn:methodLabelsTr)[option.value]||option.value;
    });
    const source=row.querySelector('.source');
    [...source.options].forEach(option=>{
      option.textContent=(currentLanguage==='en'?sourceLabelsEn:sourceLabelsTr)[option.value]||option.value;
    });
  });
}

function applyLanguage(lang){
  currentLanguage=lang==='en'?'en':'tr';
  localStorage.setItem(languageStoreKey,currentLanguage);
  const select=document.querySelector('#languageSelect');
  if(select) select.value=currentLanguage;
  translateStaticDocument();
  updateCostLanguage();
  updateCurrencyLanguage();
  renderQuoteSummary();
  loadCalculationHistory();
  loadFx();
  const hs=document.querySelector('#hsCode')?.value.trim();
  if(!hs) setHsStatus(msg('hsGlobal'));
  loadCountryTaxProfile();
}

const weights={LIVE:1,OFFICIAL:.98,QUOTE:.92,MARKET_AVG:.82,MANUAL:.75,ESTIMATE:.60};
const spreads={LIVE:.02,OFFICIAL:.005,QUOTE:.04,MARKET_AVG:.10,MANUAL:.08,ESTIMATE:.18};
const sourceLabelsTr={LIVE:'Canlı veri',OFFICIAL:'Resmî kaynak',QUOTE:'Güncel teklif',MARKET_AVG:'Piyasa ortalaması',MANUAL:'Manuel veri',ESTIMATE:'Tahmin'};
const sourceLabelsEn={LIVE:'Live data',OFFICIAL:'Official source',QUOTE:'Current quote',MARKET_AVG:'Market average',MANUAL:'Manual data',ESTIMATE:'Estimate'};
const methodLabelsTr={FIXED:'Sevkiyat başına',PER_CONTAINER:'Ekipman başına',PER_MT:'MT başına',PCT_GOODS:'Ürün bedelinin %',PCT_CUSTOMS:'Gümrük kıymetinin %',PCT_IMPORT_TAX:'Gümrük kıymeti + verginin %'};
const methodLabelsEn={FIXED:'Per shipment',PER_CONTAINER:'Per equipment',PER_MT:'Per MT',PCT_GOODS:'% of goods value',PCT_CUSTOMS:'% of customs value',PCT_IMPORT_TAX:'% of customs value + duty'};
const INCOTERM_SCOPE={
  EXW:{modes:['ANY'],included:[]},
  FCA:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE']},
  CPT:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL']},
  CIP:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL','INSURANCE']},
  DAP:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL','INSURANCE','DESTINATION_CHARGES','DESTINATION_INLAND']},
  DPU:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL','INSURANCE','DESTINATION_CHARGES','DESTINATION_INLAND']},
  DDP:{modes:['ANY'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL','INSURANCE','DESTINATION_CHARGES','IMPORT_DUTY','IMPORT_TAX','CUSTOMS_BROKERAGE','DESTINATION_INLAND']},
  FAS:{modes:['SEA'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE']},
  FOB:{modes:['SEA'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE']},
  CFR:{modes:['SEA'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL']},
  CIF:{modes:['SEA'],included:['ORIGIN_INLAND','EXPORT_CLEARANCE','FREIGHT_INTL','INSURANCE']}
};

function incotermAnalysis(){
  const term=document.querySelector('#incoterm').value;
  const mode=document.querySelector('#transportMode').value;
  const profile=INCOTERM_SCOPE[term];
  if(!profile) return {compatible:false,duplicates:[]};
  const compatible=profile.modes.includes('ANY')||profile.modes.includes(mode);
  const duplicates=[...document.querySelectorAll('.cost-row')]
    .filter(row=>profile.included.includes(row.dataset.code))
    .filter(row=>Number(row.querySelector('.rate').value)>0)
    .map(row=>row.querySelector('.label').value||row.dataset.code);
  return {compatible,duplicates,term,mode};
}

function updateIncotermStatus(){
  const el=document.querySelector('#incotermStatus');
  if(!el) return;
  const a=incotermAnalysis();
  if(!a.compatible){
    el.textContent=currentLanguage==='en'
      ? a.term+' is restricted to sea/inland-waterway use in this model. Select a compatible Incoterm for '+a.mode+'.'
      : a.term+' bu modelde deniz/iç suyolu kullanımına ayrılmıştır. '+a.mode+' için uyumlu bir Incoterm seçin.';
    el.className='field-status error';
    return;
  }
  if(a.duplicates.length){
    el.textContent=currentLanguage==='en'
      ? 'Potential double count: '+a.duplicates.join(', ')+' may already be included in the supplier '+a.term+' price.'
      : 'Olası çifte sayım: '+a.duplicates.join(', ')+' tedarikçinin '+a.term+' fiyatına zaten dahil olabilir.';
    el.className='field-status warning';
    return;
  }
  el.textContent=currentLanguage==='en'
    ? 'Supplier price is interpreted at the selected '+a.term+' delivery scope. Country customs valuation is verified separately.'
    : 'Tedarikçi fiyatı seçilen '+a.term+' teslim kapsamına göre yorumlanır. Ülke gümrük kıymeti ayrıca doğrulanır.';
  el.className='field-status verified';
}

const sourceLabels=currentLanguage==='en'?sourceLabelsEn:sourceLabelsTr;
const methodLabels=currentLanguage==='en'?methodLabelsEn:methodLabelsTr;
const defaults=[
  ['Çıkış iç nakliye','PER_CONTAINER','','ESTIMATE','ORIGIN_INLAND'],
  ['İhracat gümrüğü ve belgeler','FIXED','','ESTIMATE','EXPORT_CLEARANCE'],
  ['Uluslararası navlun','PER_CONTAINER','','ESTIMATE','FREIGHT_INTL'],
  ['Yük sigortası','PCT_GOODS','','ESTIMATE','INSURANCE'],
  ['Varış / sınır masrafları','PER_CONTAINER','','ESTIMATE','DESTINATION_CHARGES'],
  ['İthalat gümrük vergisi (doğrulanacak)','PCT_CUSTOMS','','ESTIMATE','IMPORT_DUTY'],
  ['İthalat KDV / yerel vergi (doğrulanacak)','PCT_IMPORT_TAX','','ESTIMATE','IMPORT_TAX'],
  ['Gümrük müşavirliği','FIXED','','ESTIMATE','CUSTOMS_BROKERAGE'],
  ['Varış iç nakliye','PER_CONTAINER','','ESTIMATE','DESTINATION_INLAND']
];
const rows=document.querySelector('#costRows');
const quoteStoreKey='ctseg_trade_cost_quotes_v1';
const workspaceStoreKey='ctseg_trade_cost_workspace_v1';

function getWorkspaceId(){
  let id=localStorage.getItem(workspaceStoreKey);
  if(!id){
    id='ws_'+crypto.randomUUID().replace(/-/g,'');
    localStorage.setItem(workspaceStoreKey,id);
  }
  return id;
}

const workspaceId=getWorkspaceId();
let quoteCache=[];
let d1PersistenceAvailable=null;

function money(n,d=2){return new Intl.NumberFormat(currentLanguage==='en'?'en-US':'tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(Number(n)||0)}
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
  if(method==='PCT_IMPORT_TAX'){
    if(excludeCustoms) return 0;
    return importTaxBase()*(rate/100);
  }
  return 0;
}
function customsValuationValues(){
  const transactionValue=goodsTotal();
  const additions=[
    '#cvFreight','#cvInsurance','#cvPacking','#cvAssists','#cvRoyalties','#cvSellingCommission','#cvOtherAddition'
  ].reduce((sum,selector)=>sum+(Math.max(0,Number(document.querySelector(selector)?.value)||0)),0);
  const deductions=[
    '#cvPostImportTransport','#cvOtherDeduction'
  ].reduce((sum,selector)=>sum+(Math.max(0,Number(document.querySelector(selector)?.value)||0)),0);
  const value=Math.max(0,transactionValue+additions-deductions);
  return {
    transactionValue,
    additions,
    deductions,
    value,
    status:document.querySelector('#customsValuationStatus')?.value||'WORKING'
  };
}

function invalidateCustomsValuation(){
  const status=document.querySelector('#customsValuationStatus');
  if(status && status.value==='VERIFIED') status.value='WORKING';
}

function updateCustomsValuation(){
  const v=customsValuationValues();
  const tx=document.querySelector('#customsTransactionValue');
  const value=document.querySelector('#customsValue');
  const note=document.querySelector('#customsValuationNote');
  if(tx) tx.value=v.transactionValue?String(Number(v.transactionValue.toFixed(2))):'';
  if(value) value.value=String(Number(v.value.toFixed(2)));
  if(note){
    note.textContent=v.status==='VERIFIED'
      ? (currentLanguage==='en'
        ? 'Customs value marked verified for this scenario. Re-verify if price, Incoterm or adjustments change.'
        : 'Gümrük kıymeti bu senaryo için doğrulandı. Fiyat, Incoterm veya düzeltmeler değişirse yeniden doğrulayın.')
      : (currentLanguage==='en'
        ? 'Working customs value only. Verify destination-country valuation treatment before final calculation.'
        : 'Bu yalnız çalışma gümrük kıymetidir. Final hesap öncesi hedef ülke valuation uygulamasını doğrulayın.');
  }
  refreshCalculatedAmounts();
  return v;
}

function customsBase(){
  return customsValuationValues().value;
}
function importTaxBase(){
  const duty=findDutyRow();
  const dutyAmount=duty?calculateRow(duty):0;
  return customsBase()+dutyAmount;
}
function findImportTaxRow(){
  return [...document.querySelectorAll('.cost-row')]
    .find(r=>/ithalat kdv|import vat|local tax|yerel vergi/i.test(r.querySelector('.label').value));
}

const TRADE_REMEDY_LABELS={
  ANTI_DUMPING:{tr:'Anti-damping vergisi',en:'Anti-dumping duty'},
  COUNTERVAILING:{tr:'Countervailing duty',en:'Countervailing duty'},
  SAFEGUARD:{tr:'Safeguard ek yükü',en:'Safeguard duty'},
  ADDITIONAL_TARIFF:{tr:'Additional tariff',en:'Additional tariff'},
  RETALIATORY_TARIFF:{tr:'Retaliatory tariff',en:'Retaliatory tariff'},
  OTHER_TRADE_REMEDY:{tr:'Diğer ticaret önlemi',en:'Other trade remedy'}
};

function currentTradeRemedyKey(){
  return [
    document.querySelector('#hsCode')?.value.trim()||'',
    document.querySelector('#originCountry')?.value||'',
    document.querySelector('#importCountry')?.value||''
  ].join(':');
}

function tradeRemedyMethod(basis){
  if(basis==='CUSTOMS_VALUE_PERCENT') return 'PCT_CUSTOMS';
  if(basis==='GOODS_VALUE_PERCENT') return 'PCT_GOODS';
  if(basis==='PER_MT') return 'PER_MT';
  return 'FIXED';
}

function refreshTradeRemedyValidity(){
  const currentKey=currentTradeRemedyKey();
  const remedyRows=[...document.querySelectorAll('.cost-row')].filter(row=>/^REMEDY_/.test(row.dataset.code||''));
  let stale=0;
  for(const row of remedyRows){
    const isStale=!row.dataset.remedyKey || row.dataset.remedyKey!==currentKey;
    row.classList.toggle('stale-remedy',isStale);
    if(isStale) stale++;
  }
  const note=document.querySelector('#tradeRemedyNote');
  if(note){
    note.textContent=stale
      ? (currentLanguage==='en'
        ? stale+' trade-remedy row(s) no longer match the current HS/origin/import route. Remove and re-add them after verification.'
        : stale+' adet ticaret önlemi mevcut HS/menşe/ithalat rotasıyla artık eşleşmiyor. Doğruladıktan sonra kaldırıp yeniden ekleyin.')
      : (currentLanguage==='en'
        ? 'Existing remedy rows must be re-verified if HS, origin or import country changes.'
        : 'HS, menşe ve ithalat ülkesi değişirse mevcut remedy satırları yeniden doğrulanmalıdır.');
  }
}

async function checkTradeRemedySources(){
  const hs=document.querySelector('#hsCode')?.value.trim()||'';
  const origin=selectedCountryIso2('#originCountry');
  const destination=selectedCountryIso2('#importCountry');
  const type=document.querySelector('#tradeRemedyType')?.value||'';
  const list=document.querySelector('#tradeRemedySources');
  const note=document.querySelector('#tradeRemedyNote');

  if(!/^\d{6}$/.test(hs)||!origin||!destination){
    alert(currentLanguage==='en'
      ? 'Select a valid HS6, country of origin and import country first.'
      : 'Önce geçerli HS6, menşe ülke ve ithalat ülkesini seçin.');
    return;
  }

  list.innerHTML=currentLanguage==='en'
    ? '<div class="remedy-source-card">Checking official sources…</div>'
    : '<div class="remedy-source-card">Resmî kaynaklar kontrol ediliyor…</div>';

  try{
    const params=new URLSearchParams({
      action:'lookup',
      hs,
      origin,
      import:destination,
      type
    });
    const res=await fetch('/api/trade-remedies?'+params.toString(),{cache:'no-store'});
    const data=await res.json();
    if(!res.ok) throw new Error(data?.message||data?.error||'Trade-remedy source lookup failed');

    const providers=Array.isArray(data.providers)?data.providers:[];
    if(!providers.length){
      list.innerHTML='<div class="remedy-source-card muted">'+(currentLanguage==='en'
        ? 'No connected official provider for this destination. Manual verification is required.'
        : 'Bu hedef ülke için bağlı resmî provider yok. Manuel doğrulama gerekli.')+'</div>';
      if(note) note.textContent=currentLanguage==='en'
        ? 'No automated official discovery source is connected for this route.'
        : 'Bu rota için otomatik resmî discovery kaynağı bağlı değil.';
      return;
    }

    list.innerHTML=providers.map(provider=>{
      const mode=provider.mode==='EXECUTION_REFERENCE'
        ? (currentLanguage==='en'?'Execution reference':'Uygulama referansı')
        : (currentLanguage==='en'?'Official discovery':'Resmî tarama');
      const types=(provider.types||[]).join(', ');
      const notes=(provider.notes||[]).map(n=>'<li>'+n+'</li>').join('');
      return `<div class="remedy-source-card">
        <div class="remedy-source-top">
          <strong>${provider.name}</strong>
          <span>${mode}</span>
        </div>
        <small>${provider.authority||''}</small>
        <p>${currentLanguage==='en'?'Coverage':'Kapsam'}: ${types}</p>
        ${notes?'<ul>'+notes+'</ul>':''}
        <a href="${provider.sourceUrl}" target="_blank" rel="noopener noreferrer">${currentLanguage==='en'?'Open official source':'Resmî kaynağı aç'}</a>
      </div>`;
    }).join('');

    if(note) note.textContent=currentLanguage==='en'
      ? 'Official source availability found. Provider evidence is discovery only; verify scope, exporter, legal reference and executable rate before adding a remedy.'
      : 'Resmî kaynak bulundu. Provider verisi yalnız discovery amaçlıdır; remedy eklemeden önce kapsam, ihracatçı, hukuki referans ve uygulanabilir oranı doğrulayın.';
  }catch{
    list.innerHTML='<div class="remedy-source-card warning">'+(currentLanguage==='en'
      ? 'Official-source lookup failed. Keep the remedy in manual verification mode.'
      : 'Resmî kaynak kontrolü başarısız. Remedy satırını manuel doğrulama modunda tutun.')+'</div>';
  }
}

function addVerifiedTradeRemedy(){
  const hs=document.querySelector('#hsCode')?.value.trim()||'';
  const origin=document.querySelector('#originCountry')?.value||'';
  const destination=document.querySelector('#importCountry')?.value||'';
  if(!/^\d{6}$/.test(hs)||!origin||!destination){
    alert(currentLanguage==='en'
      ? 'Select a valid HS6, country of origin and import country before adding a trade remedy.'
      : 'Ticaret önlemi eklemeden önce geçerli HS6, menşe ülke ve ithalat ülkesini seçin.');
    return;
  }

  const type=document.querySelector('#tradeRemedyType')?.value||'OTHER_TRADE_REMEDY';
  const basis=document.querySelector('#tradeRemedyBasis')?.value||'CUSTOMS_VALUE_PERCENT';
  const rateRaw=document.querySelector('#tradeRemedyRate')?.value.trim()||'';
  const rate=rateRaw===''?null:Number(rateRaw);
  const source=document.querySelector('#tradeRemedySource')?.value||'MANUAL';
  const reference=document.querySelector('#tradeRemedyReference')?.value.trim()||'';

  if(rate===null||!Number.isFinite(rate)||rate<0){
    alert(currentLanguage==='en'?'Enter a verified non-negative remedy rate or amount.':'Doğrulanmış sıfır veya pozitif remedy oranı/tutarı girin.');
    document.querySelector('#tradeRemedyRate')?.focus();
    return;
  }
  if(!reference){
    alert(currentLanguage==='en'?'An official decision, case or document reference is required.':'Resmî karar, dava veya belge referansı gerekli.');
    document.querySelector('#tradeRemedyReference')?.focus();
    return;
  }

  if(basis==='CUSTOMS_VALUE_PERCENT' && document.querySelector('#customsValuationStatus')?.value!=='VERIFIED'){
    alert(currentLanguage==='en'
      ? 'Verify customs value before adding a customs-value-based trade remedy.'
      : 'Gümrük kıymeti bazlı bir ticaret önlemi eklemeden önce gümrük kıymetini doğrulayın.');
    document.querySelector('#customsValuationStatus')?.focus();
    return;
  }

  const labels=TRADE_REMEDY_LABELS[type]||TRADE_REMEDY_LABELS.OTHER_TRADE_REMEDY;
  const label=currentLanguage==='en'?labels.en:labels.tr;
  const code='REMEDY_'+type+'_'+Date.now();
  addRow([
    label,
    tradeRemedyMethod(basis),
    rate,
    source,
    code,
    {
      remedyType:type,
      remedyBasis:basis,
      remedyReference:reference,
      remedyKey:currentTradeRemedyKey()
    }
  ]);
  document.querySelector('#tradeRemedyRate').value='';
  document.querySelector('#tradeRemedyReference').value='';
  refreshTradeRemedyValidity();
  refreshCalculatedAmounts();
}

const ADDITIONAL_TAX_DEFAULTS={
  VAT_GST:{tr:'İthalat KDV / GST (doğrulanacak)',en:'Import VAT / GST (to be verified)',method:'PCT_IMPORT_TAX',code:'IMPORT_TAX'},
  EXCISE:{tr:'ÖTV / Excise (doğrulanacak)',en:'Excise tax (to be verified)',method:'PER_MT',code:'TAX_EXCISE'},
  SURCHARGE:{tr:'Ek ithalat vergisi / Surcharge (doğrulanacak)',en:'Import surcharge (to be verified)',method:'PCT_CUSTOMS',code:'TAX_SURCHARGE'},
  IMPORT_LEVY:{tr:'Import levy (doğrulanacak)',en:'Import levy (to be verified)',method:'PCT_CUSTOMS',code:'TAX_IMPORT_LEVY'},
  CUSTOMS_PROCESSING_FEE:{tr:'Gümrük işlem ücreti (doğrulanacak)',en:'Customs processing fee (to be verified)',method:'FIXED',code:'TAX_PROCESSING_FEE'},
  OTHER_IMPORT_TAX:{tr:'Diğer ithalat vergisi (doğrulanacak)',en:'Other import tax (to be verified)',method:'FIXED',code:'TAX_OTHER'}
};

function applyVerifiedImportTaxRate(){
  const rateEl=document.querySelector('#verifiedImportTaxRate');
  const sourceEl=document.querySelector('#verifiedImportTaxSource');
  const rateRaw=rateEl?.value?.trim()||'';
  const rate=rateRaw===''?null:Number(rateRaw);
  if(rate===null||!Number.isFinite(rate)||rate<0){
    alert(currentLanguage==='en'?'Enter a verified non-negative VAT/GST rate.':'Doğrulanmış, sıfır veya pozitif bir KDV/GST oranı girin.');
    rateEl?.focus();
    return;
  }

  let row=findImportTaxRow();
  if(!row){
    addRow([
      currentLanguage==='en'?'Import VAT / GST':'İthalat KDV / GST',
      'PCT_IMPORT_TAX',
      rate,
      sourceEl?.value||'MANUAL',
      'IMPORT_TAX'
    ]);
    row=findImportTaxRow();
  }

  if(row){
    row.dataset.code='IMPORT_TAX';
    row.querySelector('.label').value=currentLanguage==='en'?'Import VAT / GST':'İthalat KDV / GST';
    row.querySelector('.method').value='PCT_IMPORT_TAX';
    row.querySelector('.rate').value=String(rate);
    row.querySelector('.source').value=sourceEl?.value||'MANUAL';
    refreshCalculatedAmounts();
  }
}

function addSelectedImportTax(){
  const type=document.querySelector('#additionalTaxType')?.value||'OTHER_IMPORT_TAX';
  if(type==='VAT_GST'){
    applyVerifiedImportTaxRate();
    return;
  }
  const def=ADDITIONAL_TAX_DEFAULTS[type]||ADDITIONAL_TAX_DEFAULTS.OTHER_IMPORT_TAX;
  addRow([currentLanguage==='en'?def.en:def.tr,def.method,'','ESTIMATE',def.code]);
  const rows=[...document.querySelectorAll('.cost-row')];
  rows[rows.length-1]?.querySelector('.rate')?.focus();
}

function addRow([label='',method='FIXED',rate=0,source='ESTIMATE',code='OTHER',meta=null]={}){
  const div=document.createElement('div');
  div.className='cost-row';
  div.dataset.code=code||'OTHER';
  if(meta?.remedyType) div.dataset.remedyType=meta.remedyType;
  if(meta?.remedyBasis) div.dataset.remedyBasis=meta.remedyBasis;
  if(meta?.remedyReference) div.dataset.remedyReference=meta.remedyReference;
  if(meta?.remedyKey) div.dataset.remedyKey=meta.remedyKey;
  div.innerHTML=`
    <input class="label" value="${label}">
    <select class="method">${Object.keys(methodLabelsTr).map(k=>`<option value="${k}" ${k===method?'selected':''}>${(currentLanguage==='en'?methodLabelsEn:methodLabelsTr)[k]}</option>`).join('')}</select>
    <input class="rate" type="number" min="0" step="0.01" value="${rate}">
    <select class="source">${Object.keys(sourceLabelsTr).map(k=>`<option value="${k}" ${k===source?'selected':''}>${(currentLanguage==='en'?sourceLabelsEn:sourceLabelsTr)[k]}</option>`).join('')}</select>
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
  updateCustomsValuation();
  renderQuoteSummary();
  updateIncotermStatus();
}

defaults.forEach(addRow);
document.querySelector('#addCost').addEventListener('click',()=>addRow());
['containerCount','payloadPerContainer','price','priceUnit'].forEach(id=>document.querySelector('#'+id).addEventListener('input',syncShipment));
['origin','destination','containerType','transportMode','originCountry','exportCountry','importCountry','transitCountries'].forEach(id=>document.querySelector('#'+id).addEventListener('input',renderQuoteSummary));
syncShipment();


let countryReference=[];
let tariffRequestSeq=0;
let taxRuleRequestSeq=0;
let lastTariffData=null;
let lastTariffKey=null;

async function loadCountries(){
  const originSelect=document.querySelector('#originCountry');
  const exportSelect=document.querySelector('#exportCountry');
  const importSelect=document.querySelector('#importCountry');
  const taxRuleSelect=document.querySelector('#taxRuleCountrySelect');

  try{
    const res=await fetch('/api/countries',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok) throw new Error(data?.message||data?.error||'Ülke listesi alınamadı');

    countryReference=Array.isArray(data.countries)?data.countries:[];

    const fill=(select,preferredCode)=>{
      select.replaceChildren();
      const placeholder=document.createElement('option');
      placeholder.value='';
      placeholder.textContent=msg('countrySelect');
      select.appendChild(placeholder);

      for(const country of countryReference){
        const option=document.createElement('option');
        option.value=country.code;
        option.textContent=country.name+(country.iso2?` (${country.iso2})`:'');
        option.dataset.iso2=country.iso2||'';
        option.dataset.iso3=country.iso3||'';
        select.appendChild(option);
      }

      if(preferredCode && countryReference.some(c=>c.code===preferredCode)){
        select.value=preferredCode;
      }
    };

    fill(originSelect);
    fill(exportSelect);
    fill(importSelect);
    fill(taxRuleSelect);
  }catch{
    originSelect.innerHTML='<option value="">'+(currentLanguage==='en'?'Country list unavailable':'Ülke listesi alınamadı')+'</option>';
    exportSelect.innerHTML='<option value="">'+(currentLanguage==='en'?'Country list unavailable':'Ülke listesi alınamadı')+'</option>';
    importSelect.innerHTML='<option value="">'+(currentLanguage==='en'?'Country list unavailable':'Ülke listesi alınamadı')+'</option>';
    if(taxRuleSelect) taxRuleSelect.innerHTML='<option value="">'+(currentLanguage==='en'?'Country list unavailable':'Ülke listesi alınamadı')+'</option>';
  }
}

function selectedCountryName(selector){
  const el=document.querySelector(selector);
  return el.selectedOptions[0]?.textContent?.replace(/\s*\([A-Z]{2}\)\s*$/,'')||'—';
}

function selectedCountryIso2(selector){
  const code=document.querySelector(selector)?.value;
  return countryReference.find(x=>x.code===code)?.iso2||null;
}

function parseTransitCountries(){
  const raw=document.querySelector('#transitCountries')?.value||'';
  if(!raw.trim()) return [];
  const codes=raw.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);
  const unique=[...new Set(codes)];
  const invalid=unique.filter(code=>!/^[A-Z]{2}$/.test(code)||!countryReference.some(c=>c.iso2===code));
  return {codes:unique,invalid};
}

async function loadCountryTaxProfile(){
  const countrySelect=document.querySelector('#taxRuleCountrySelect');
  const statusEl=document.querySelector('#taxRuleStatus');
  const modelEl=document.querySelector('#taxRuleModel');
  const ratePolicyEl=document.querySelector('#taxRuleRatePolicy');
  const noteEl=document.querySelector('#taxRuleNote');
  if(!countrySelect||!statusEl||!modelEl||!ratePolicyEl||!noteEl) return null;

  const importValue=document.querySelector('#importCountry')?.value||'';
  if(countrySelect.value!==importValue) countrySelect.value=importValue;
  const iso2=selectedCountryIso2('#taxRuleCountrySelect');

  if(!iso2){
    statusEl.textContent=msg('taxRuleMissing');
    modelEl.textContent='—';
    ratePolicyEl.textContent='—';
    noteEl.textContent=currentLanguage==='en'
      ? 'Select an import country to check tax-rule support.'
      : 'Vergi kuralı desteğini kontrol etmek için ithalat ülkesi seçin.';
    return null;
  }

  const seq=++taxRuleRequestSeq;
  statusEl.textContent=msg('taxRuleLoading');
  modelEl.textContent='—';
  ratePolicyEl.textContent='—';

  try{
    const res=await fetch('/api/tax?country='+encodeURIComponent(iso2),{cache:'no-store'});
    const data=await res.json();
    if(seq!==taxRuleRequestSeq) return null;
    if(!res.ok) throw new Error(data?.message||data?.error||'Tax rule profile failed');

    const profile=data.profile||{};
    const configured=profile.status==='COUNTRY_SPECIFIC';
    statusEl.textContent=configured
      ? (currentLanguage==='en'?'Country-specific support available':'Ülkeye özel destek mevcut')
      : (currentLanguage==='en'?'Manual verification required':'Manuel doğrulama gerekli');
    modelEl.textContent=configured
      ? (currentLanguage==='en'?'Import VAT/GST model':'İthalat KDV/GST modeli')
      : (currentLanguage==='en'?'VAT/GST + additional import taxes':'KDV/GST + ek ithalat vergileri');
    ratePolicyEl.textContent=profile.ratePolicy==='PRODUCT_RATE_MUST_BE_VERIFIED'
      ? (currentLanguage==='en'?'Verify by product / HS':'Ürün / HS bazında doğrula')
      : (currentLanguage==='en'?'Enter verified rate':'Doğrulanmış oran gir');
    noteEl.textContent=configured
      ? (currentLanguage==='en'
        ? 'A country-specific calculation structure is available. Verify the product-specific rate and transaction treatment before final calculation.'
        : 'Ülkeye özel hesaplama yapısı mevcut. Final hesap öncesi ürün bazlı oranı ve işlem türünü doğrulayın.')
      : (currentLanguage==='en'
        ? 'No country-specific automatic tax source is connected yet. Enter only verified destination-country tax rates.'
        : 'Bu ülke için ülkeye özel otomatik vergi kaynağı henüz bağlı değil. Yalnızca doğrulanmış hedef ülke vergi oranlarını girin.');
    return profile;
  }catch{
    if(seq!==taxRuleRequestSeq) return null;
    statusEl.textContent=msg('taxRuleUnavailable');
    modelEl.textContent='—';
    ratePolicyEl.textContent='—';
    noteEl.textContent=currentLanguage==='en'
      ? 'Country tax-rule profile could not be loaded. Keep import tax in manual verification mode.'
      : 'Ülke vergi kuralı profili alınamadı. İthalat vergisini manuel doğrulama modunda tutun.';
    return null;
  }
}

function findDutyRow(){
  return [...document.querySelectorAll('.cost-row')]
    .find(r=>/ithalat gümrük vergisi|import duty/i.test(r.querySelector('.label').value));
}

function currentTariffKey(){
  return [
    document.querySelector('#hsCode')?.value.trim()||'',
    document.querySelector('#originCountry')?.value||'',
    document.querySelector('#importCountry')?.value||''
  ].join(':');
}

function resetPreferentialVerification(){
  const eligibility=document.querySelector('#preferentialEligibility');
  const rate=document.querySelector('#verifiedPreferentialRate');
  const scheme=document.querySelector('#preferentialSchemeReference');
  if(eligibility) eligibility.value='NOT_CONFIRMED';
  if(rate) rate.value='';
  if(scheme) scheme.value='';
}

function preferentialDecision(){
  const normalized=lastTariffData?.normalized||{};
  const mfnRaw=normalized?.appliedRateDecision?.rate;
  const mfn=(mfnRaw===null||mfnRaw===undefined||mfnRaw==='')?null:Number(mfnRaw);
  const candidateRaw=normalized?.preferentialCandidate?.rate;
  const candidate=(candidateRaw===null||candidateRaw===undefined||candidateRaw==='')?null:Number(candidateRaw);
  const eligibility=document.querySelector('#preferentialEligibility')?.value||'NOT_CONFIRMED';
  const verifiedRaw=document.querySelector('#verifiedPreferentialRate')?.value;
  const verified=(verifiedRaw===null||verifiedRaw===undefined||verifiedRaw==='')?null:Number(verifiedRaw);
  const scheme=document.querySelector('#preferentialSchemeReference')?.value.trim()||'';

  if(eligibility==='ELIGIBLE' && Number.isFinite(verified) && verified>=0 && scheme){
    return {
      rate:verified,
      basis:'PREFERENTIAL_VERIFIED',
      source:'MANUAL',
      scheme,
      candidateRate:Number.isFinite(candidate)?candidate:null,
      mfnRate:Number.isFinite(mfn)?mfn:null
    };
  }

  return {
    rate:Number.isFinite(mfn)?mfn:null,
    basis:Number.isFinite(mfn)?'MFN':null,
    source:Number.isFinite(mfn)?'OFFICIAL':'ESTIMATE',
    scheme:scheme||null,
    candidateRate:Number.isFinite(candidate)?candidate:null,
    mfnRate:Number.isFinite(mfn)?mfn:null,
    preferentialIncomplete:eligibility==='ELIGIBLE'
  };
}

function renderPreferentialPanel(){
  const candidateEl=document.querySelector('#preferentialCandidateRate');
  const noteEl=document.querySelector('#preferentialNote');
  const candidate=lastTariffData?.normalized?.preferentialCandidate;
  if(candidateEl){
    candidateEl.value=Number.isFinite(Number(candidate?.rate))
      ? '%'+money(Number(candidate.rate),2)
      : '';
  }

  const decision=preferentialDecision();
  if(noteEl){
    if(decision.basis==='PREFERENTIAL_VERIFIED'){
      noteEl.textContent=currentLanguage==='en'
        ? 'Verified preferential rate '+money(decision.rate,2)+'% will be used. Reference: '+decision.scheme
        : 'Doğrulanmış preferential %'+money(decision.rate,2)+' oranı kullanılacak. Referans: '+decision.scheme;
    }else if(decision.preferentialIncomplete){
      noteEl.textContent=currentLanguage==='en'
        ? 'Eligibility is marked eligible, but a verified rate and scheme/reference are still required. MFN remains in use.'
        : 'Uygunluk “uygun” seçildi ancak doğrulanmış oran ve scheme/referans eksik. MFN kullanılmaya devam ediyor.';
    }else if(candidate){
      noteEl.textContent=currentLanguage==='en'
        ? 'WTO candidate '+money(Number(candidate.rate),2)+'% is not applied automatically. MFN remains the safe default.'
        : 'WTO aday oranı %'+money(Number(candidate.rate),2)+' otomatik uygulanmaz. MFN güvenli varsayılan olarak kalır.';
    }else{
      noteEl.textContent=currentLanguage==='en'
        ? 'No preferential candidate was returned. MFN remains the reference rate.'
        : 'Preferential aday dönmedi. MFN referans oran olarak kalır.';
    }
  }
}

function applyTariffSelection(){
  const duty=findDutyRow();
  if(!duty) return;
  const normalized=lastTariffData?.normalized||null;
  const decision=preferentialDecision();
  const hasResolvedYear=Number.isFinite(Number(normalized?.resolvedYear));

  if(hasResolvedYear && Number.isFinite(decision.rate)){
    duty.querySelector('.rate').value=String(decision.rate);
    duty.querySelector('.source').value=decision.source;
    duty.querySelector('.label').value=currentLanguage==='en'?'Import duty':'İthalat gümrük vergisi';
    const rateEl=document.querySelector('#tariffRate');
    if(rateEl){
      rateEl.textContent='%'+money(decision.rate,2)+(decision.basis==='PREFERENTIAL_VERIFIED'?' · PREF':' · MFN');
    }
  }else{
    duty.querySelector('.rate').value='';
    duty.querySelector('.source').value='ESTIMATE';
    duty.querySelector('.label').value=currentLanguage==='en'?'Import duty (to be verified)':'İthalat gümrük vergisi (doğrulanacak)';
  }
  renderPreferentialPanel();
  refreshCalculatedAmounts();
}

function applyTariffToUi(normalized){
  if(!normalized){
    lastTariffData=null;
    const duty=findDutyRow();
    if(duty){
      duty.querySelector('.rate').value='';
      duty.querySelector('.source').value='ESTIMATE';
      duty.querySelector('.label').value=currentLanguage==='en'?'Import duty (to be verified)':'İthalat gümrük vergisi (doğrulanacak)';
    }
    const candidateEl=document.querySelector('#preferentialCandidateRate');
    if(candidateEl) candidateEl.value='';
    renderPreferentialPanel();
    refreshCalculatedAmounts();
    return;
  }
  applyTariffSelection();
}

async function loadTariff(){
  const hs=document.querySelector('#hsCode').value.trim();
  const reporter=document.querySelector('#importCountry').value;
  const partner=document.querySelector('#originCountry').value;
  const rateEl=document.querySelector('#tariffRate');
  const yearEl=document.querySelector('#tariffYear');
  const statusEl=document.querySelector('#tariffStatus');
  const noteEl=document.querySelector('#tariffNote');
  const hsEl=document.querySelector('#tariffHs');

  if(!/^\d{6}$/.test(hs)||!reporter||!partner){
    hsEl.textContent=hs||'—';
    rateEl.textContent='—';
    yearEl.textContent='—';
    statusEl.textContent=msg('tariffMissing');
    noteEl.textContent=msg('tariffMissingNote');
    applyTariffToUi(null);
    return null;
  }

  const tariffKey=[hs,partner,reporter].join(':');
  if(lastTariffKey!==tariffKey){
    resetPreferentialVerification();
    lastTariffKey=tariffKey;
  }

  const seq=++tariffRequestSeq;
  hsEl.textContent=hs;
  statusEl.textContent=msg('tariffLoading');
  rateEl.textContent='—';
  yearEl.textContent='—';

  try{
    const params=new URLSearchParams({
      action:'lookup',
      hs,
      reporter,
      partner,
      year:String(new Date().getFullYear())
    });
    const res=await fetch('/api/tariff?'+params.toString(),{cache:'no-store'});
    const data=await res.json();
    if(seq!==tariffRequestSeq) return null;
    if(!res.ok) throw new Error(data?.message||data?.error||'Tarife sorgusu başarısız');

    lastTariffData=data;
    const normalized=data.normalized||{};
    const rawRate=normalized?.appliedRateDecision?.rate;
    const hasResolvedYear=Number.isFinite(Number(normalized?.resolvedYear));
    const rate=rawRate === null || rawRate === undefined || rawRate === '' ? null : Number(rawRate);
    const hasOfficialRate=hasResolvedYear && Number.isFinite(rate);

    rateEl.textContent=hasOfficialRate?'%'+money(rate,2):msg('tariffNoResolvedRate');
    yearEl.textContent=hasResolvedYear?String(normalized.resolvedYear):'—';

    if(!hasOfficialRate){
      statusEl.textContent=msg('verifyRequired');
      noteEl.textContent=msg('tariffNoResolvedNote');
      applyTariffToUi(null);
      lastTariffData=data;
      renderPreferentialPanel();
      return data;
    }

    statusEl.textContent=normalized.confidence==='HIGH'
      ?msg('highConfidence')
      :normalized.confidence==='MEDIUM'
        ?msg('mediumConfidence')
        :msg('verifyRequired');

    const pref=normalized.preferentialCandidate;
    noteEl.textContent=pref
      ? (currentLanguage==='en'
        ? `MFN was applied as the safe default. A ${money(pref.rate,2)}% preferential candidate exists, but eligibility is not confirmed.`
        : `MFN güvenli varsayılan olarak uygulandı. %${money(pref.rate,2)} preferential aday var ancak uygunluk doğrulanmadı.`)
      : msg('tariffMfn');

    applyTariffToUi(normalized);
    renderPreferentialPanel();
    return data;
  }catch(error){
    if(seq!==tariffRequestSeq) return null;
    rateEl.textContent='—';
    yearEl.textContent='—';
    statusEl.textContent=msg('tariffNoData');
    noteEl.textContent=msg('tariffNoDataNote');
    applyTariffToUi(null);
    return null;
  }
}

loadCountries().then(()=>{loadTariff();loadCountryTaxProfile()});

function loadQuotes(){
  if(quoteCache.length) return quoteCache;
  try{
    quoteCache=JSON.parse(localStorage.getItem(quoteStoreKey)||'[]');
    return quoteCache;
  }catch{
    quoteCache=[];
    return quoteCache;
  }
}

function saveQuotes(quotes){
  quoteCache=[...quotes];
  localStorage.setItem(quoteStoreKey,JSON.stringify(quoteCache));
}

async function hydrateQuotesFromD1(){
  try{
    const params=new URLSearchParams({workspaceId});
    const res=await fetch('/api/quotes?'+params.toString(),{cache:'no-store'});
    if(res.status===503){d1PersistenceAvailable=false;return false}
    if(!res.ok) throw new Error();
    const data=await res.json();
    d1PersistenceAvailable=true;
    quoteCache=Array.isArray(data.quotes)?data.quotes:[];
    localStorage.setItem(quoteStoreKey,JSON.stringify(quoteCache));
    renderQuoteSummary();
    return true;
  }catch{
    d1PersistenceAvailable=false;
    return false;
  }
}

async function persistQuoteToD1(quote){
  if(d1PersistenceAvailable===false) return false;
  try{
    const res=await fetch('/api/quotes',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        workspaceId,provider:quote.provider,rate:quote.rate,date:quote.date,
        validUntil:quote.validUntil,origin:quote.origin,destination:quote.destination,
        equipment:quote.containerType,transportMode:quote.transportMode||document.querySelector('#transportMode')?.value||'SEA',
        currency:'USD',sourceType:'QUOTE',
        countryOfOrigin:document.querySelector('#originCountry')?.value||null,
        exportCountry:document.querySelector('#exportCountry')?.value||null,
        originCountry:document.querySelector('#exportCountry')?.value||null,
        destinationCountry:document.querySelector('#importCountry')?.value||null,
        transitCountries:parseTransitCountries().codes||[],
        commodity:document.querySelector('#productName')?.value||null
      })
    });
    if(res.status===503){d1PersistenceAvailable=false;return false}
    if(!res.ok) throw new Error();
    const data=await res.json();
    d1PersistenceAvailable=true;
    if(data.quote?.id) quote.id=data.quote.id;
    return true;
  }catch{return false}
}

async function deleteQuoteFromD1(id){
  if(d1PersistenceAvailable!==true) return false;
  try{
    const params=new URLSearchParams({workspaceId,id});
    const res=await fetch('/api/quotes?'+params.toString(),{method:'DELETE'});
    return res.ok;
  }catch{return false}
}

async function persistCalculationSnapshot(input,result){
  if(d1PersistenceAvailable===false) return false;
  try{
    const res=await fetch('/api/calculations',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({workspaceId,input,result})
    });
    if(res.status===503){d1PersistenceAvailable=false;return false}
    if(!res.ok) throw new Error();
    d1PersistenceAvailable=true;
    return true;
  }catch{return false}
}
async function deleteCalculationHistory(id=null){
  const params=new URLSearchParams({workspaceId});
  if(id) params.set('id',id);
  else params.set('all','true');

  const res=await fetch('/api/calculations?'+params.toString(),{method:'DELETE'});
  if(!res.ok) throw new Error();
  return res.json();
}

async function loadCalculationHistory(){
  const list=document.querySelector('#calculationHistory');
  if(!list) return [];
  list.innerHTML='<p class="empty">'+(currentLanguage==='en'?'Loading calculation history…':'Geçmiş hesaplamalar yükleniyor…')+'</p>';

  try{
    const params=new URLSearchParams({workspaceId,limit:'20'});
    const res=await fetch('/api/calculations?'+params.toString(),{cache:'no-store'});
    if(!res.ok) throw new Error();
    const data=await res.json();
    const items=Array.isArray(data.calculations)?data.calculations:[];
    renderCalculationHistory(items);
    return items;
  }catch{
    list.innerHTML='<p class="empty">'+(currentLanguage==='en'?'Calculation history could not be loaded.':'Geçmiş hesaplamalar yüklenemedi.')+'</p>';
    return [];
  }
}

function formatHistoryDate(value){
  if(!value) return '—';
  const date=new Date(value.includes('T')?value:value.replace(' ','T')+'Z');
  if(Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(currentLanguage==='en'?'en-US':'tr-TR',{
    dateStyle:'medium',timeStyle:'short'
  }).format(date);
}

function renderCalculationHistory(items){
  const list=document.querySelector('#calculationHistory');
  if(!items.length){
    list.innerHTML='<p class="empty">'+(currentLanguage==='en'?'No saved calculations yet.':'Henüz kayıtlı hesaplama yok.')+'</p>';
    return;
  }

  list.replaceChildren();
  for(const item of items){
    const input=item.input||{};
    const result=item.result||{};
    const product=input.product?.name||'—';
    const hs=input.product?.hsCode||'—';
    const origin=input.route?.origin||'—';
    const destination=input.route?.destination||'—';
    const total=Number(result.total);

    const row=document.createElement('div');
    row.className='history-item';

    const main=document.createElement('div');
    main.className='history-main';
    const mainStrong=document.createElement('strong');
    mainStrong.textContent=product;
    const mainMeta=document.createElement('span');
    mainMeta.textContent='HS '+hs+' · '+formatHistoryDate(item.createdAt);
    main.append(mainStrong,mainMeta);

    const route=document.createElement('div');
    route.className='history-route';
    const routeStrong=document.createElement('strong');
    routeStrong.textContent=origin+' → '+destination;
    const shipment=input.shipment||{};
    const routeMeta=document.createElement('span');
    routeMeta.textContent=(shipment.containerCount||'—')+' × '+(shipment.containerType||'—');
    route.append(routeStrong,routeMeta);

    const totalBox=document.createElement('div');
    totalBox.className='history-total';
    const totalStrong=document.createElement('strong');
    totalStrong.textContent=Number.isFinite(total)?'$'+money(total,0):'—';
    const totalMeta=document.createElement('span');
    totalMeta.textContent=currentLanguage==='en'?'historical snapshot':'geçmiş snapshot';
    totalBox.append(totalStrong,totalMeta);

    const actions=document.createElement('div');
    actions.className='history-row-actions';

    const button=document.createElement('button');
    button.type='button';
    button.textContent=currentLanguage==='en'?'Reload':'Yeniden yükle';
    button.addEventListener('click',()=>restoreCalculationSnapshot(item));

    const del=document.createElement('button');
    del.type='button';
    del.className='danger-action';
    del.textContent=currentLanguage==='en'?'Delete':'Sil';
    del.addEventListener('click',async()=>{
      const ok=confirm(currentLanguage==='en'
        ? 'Delete this calculation history record permanently?'
        : 'Bu geçmiş hesaplama kaydı kalıcı olarak silinsin mi?');
      if(!ok) return;
      try{
        await deleteCalculationHistory(item.id);
        await loadCalculationHistory();
      }catch{
        alert(currentLanguage==='en'?'History record could not be deleted.':'Geçmiş kaydı silinemedi.');
      }
    });

    actions.append(button,del);
    row.append(main,route,totalBox,actions);
    list.appendChild(row);
  }
}

async function restoreCalculationSnapshot(item){
  const input=item?.input||{};
  const result=item?.result||{};

  if(input.product?.name!==undefined) document.querySelector('#productName').value=input.product.name;
  if(input.product?.hsCode!==undefined) document.querySelector('#hsCode').value=input.product.hsCode;

  if(input.route?.origin!==undefined) document.querySelector('#origin').value=input.route.origin;
  if(input.route?.destination!==undefined) document.querySelector('#destination').value=input.route.destination;
  if(input.route?.originCountry!==undefined) document.querySelector('#originCountry').value=input.route.originCountry||'';
  if(input.route?.exportCountry!==undefined) document.querySelector('#exportCountry').value=input.route.exportCountry||'';
  if(input.route?.importCountry!==undefined) document.querySelector('#importCountry').value=input.route.importCountry||'';
  if(Array.isArray(input.route?.transitCountries)){
    document.querySelector('#transitCountries').value=input.route.transitCountries.join(',');
  }
  if(input.route?.incoterm && [...document.querySelector('#incoterm').options].some(o=>o.value===input.route.incoterm)){
    document.querySelector('#incoterm').value=input.route.incoterm;
  }

  const shipment=input.shipment||{};
  if(shipment.transportMode && [...document.querySelector('#transportMode').options].some(o=>o.value===shipment.transportMode)){
    document.querySelector('#transportMode').value=shipment.transportMode;
  }
  if(shipment.containerType && [...document.querySelector('#containerType').options].some(o=>o.value===shipment.containerType)){
    document.querySelector('#containerType').value=shipment.containerType;
  }
  if(Number(shipment.containerCount)>0) document.querySelector('#containerCount').value=String(shipment.containerCount);
  const inferredPayload=Number(shipment.payloadPerContainer)>0
    ? Number(shipment.payloadPerContainer)
    : (Number(shipment.netMt)>0&&Number(shipment.containerCount)>0
      ? Number(shipment.netMt)/Number(shipment.containerCount)
      : null);
  if(inferredPayload) document.querySelector('#payloadPerContainer').value=String(inferredPayload);

  if(Number(input.purchase?.price)>=0) document.querySelector('#price').value=String(input.purchase.price);
  if(input.purchase?.priceUnit && [...document.querySelector('#priceUnit').options].some(o=>o.value===input.purchase.priceUnit)){
    document.querySelector('#priceUnit').value=input.purchase.priceUnit;
  }

  if(Number.isFinite(Number(input.routeProfile?.grossWeightKg))) document.querySelector('#grossWeightKg').value=String(input.routeProfile.grossWeightKg);
  if(Number.isFinite(Number(input.routeProfile?.heightCm))) document.querySelector('#heightCm').value=String(input.routeProfile.heightCm);
  if(Number.isFinite(Number(input.routeProfile?.commercialBufferPct))) document.querySelector('#commercialBuffer').value=String(input.routeProfile.commercialBufferPct);

  if(input.customsValuation){
    const cv=input.customsValuation;
    if(cv.status && [...document.querySelector('#customsValuationStatus').options].some(o=>o.value===cv.status)){
      document.querySelector('#customsValuationStatus').value=cv.status;
    }
    const cvInputs=cv.inputs||{};
    const map={
      freight:'#cvFreight',insurance:'#cvInsurance',packing:'#cvPacking',assists:'#cvAssists',
      royalties:'#cvRoyalties',sellingCommission:'#cvSellingCommission',otherAddition:'#cvOtherAddition',
      postImportTransport:'#cvPostImportTransport',otherDeduction:'#cvOtherDeduction'
    };
    for(const [key,selector] of Object.entries(map)){
      if(Number.isFinite(Number(cvInputs[key]))) document.querySelector(selector).value=String(cvInputs[key]);
    }
  }

  if(Array.isArray(input.costRows)&&input.costRows.length){
    rows.replaceChildren();
    for(const row of input.costRows){
      addRow([row.label,row.method,row.rate,row.source,row.code||'OTHER',row.remedy||null]);
    }
  }

  lastRouteData=null;
  document.querySelector('#routeDistance').textContent='—';
  document.querySelector('#routeDuration').textContent='—';
  document.querySelector('#routeTolls').textContent='—';
  document.querySelector('#routeStatus').textContent=currentLanguage==='en'?'Recalculate route':'Rotayı yeniden hesapla';
  document.querySelector('#results').hidden=true;

  syncShipment();
  refreshCalculatedAmounts();
  renderQuoteSummary();

  const notice=document.querySelector('#historySnapshotNotice');
  notice.hidden=false;
  const historicalTotal=Number(result.total);
  notice.textContent=(currentLanguage==='en'?'Historical snapshot loaded':'Geçmiş snapshot yüklendi')
    +(Number.isFinite(historicalTotal)?' · $'+money(historicalTotal,0):'')
    +(currentLanguage==='en'
      ? '. Recalculate to use current tariff, FX, route and freight data.'
      : '. Güncel tarife, kur, rota ve navlun verileri için hesabı yeniden çalıştırın.');

  const hs=String(input.product?.hsCode||'');
  if(/^\d{6}$/.test(hs)) validateHsCode(hs);
  else loadTariff();

  window.scrollTo({top:0,behavior:'smooth'});
}
function currentQuoteKey(){
  const transit=parseTransitCountries();
  return {
    origin:normalizeText(document.querySelector('#origin').value),
    destination:normalizeText(document.querySelector('#destination').value),
    countryOfOrigin:document.querySelector('#originCountry').value||null,
    exportCountry:document.querySelector('#exportCountry').value||null,
    importCountry:document.querySelector('#importCountry').value||null,
    transitCountries:Array.isArray(transit)?transit:(transit.codes||[]),
    transportMode:document.querySelector('#transportMode').value,
    containerType:document.querySelector('#containerType').value
  };
}
let lastRouteData=null;
let freightBenchmarkSeq=0;

function freightSourceLabel(sourceType){
  const labels=currentLanguage==='en'
    ? {QUOTE:'Quote',MARKET_AVG:'Market',LIVE:'Live',OFFICIAL:'Official',MANUAL:'Manual',ESTIMATE:'Estimate'}
    : {QUOTE:'Teklif',MARKET_AVG:'Piyasa',LIVE:'Canlı',OFFICIAL:'Resmî',MANUAL:'Manuel',ESTIMATE:'Tahmin'};
  return labels[sourceType]||sourceType;
}

function matchingQuotes(){
  const key=currentQuoteKey();
  const now=todayISO();
  return loadQuotes()
    .filter(q=>{
      const qTransit=Array.isArray(q.transitCountries)?q.transitCountries:(q.metadata?.transitCountries||[]);
      const qExport=q.exportCountry||q.originCountry||q.metadata?.exportCountry||null;
      const qImport=q.importCountry||q.destinationCountry||null;
      const qOrigin=q.countryOfOrigin||q.metadata?.countryOfOrigin||null;
      return normalizeText(q.origin)===key.origin
        && normalizeText(q.destination)===key.destination
        && q.containerType===key.containerType
        && (q.transportMode||'ROAD')===key.transportMode
        && (qExport||null)===(key.exportCountry||null)
        && (qImport||null)===(key.importCountry||null)
        && (qOrigin||null)===(key.countryOfOrigin||null)
        && JSON.stringify(qTransit||[])===JSON.stringify(key.transitCountries||[]);
    })
    .filter(q=>!q.validUntil||q.validUntil>=now)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));
}

async function loadFreightBenchmark(){
  const expectedEl=document.querySelector('#freightExpected');
  const rangeEl=document.querySelector('#freightRange');
  const confidenceEl=document.querySelector('#freightConfidence');
  const sourcesEl=document.querySelector('#freightSources');
  const noteEl=document.querySelector('#freightBenchmarkNote');

  const matches=matchingQuotes();
  if(!lastRouteData && !matches.length){
    expectedEl.textContent='—';
    rangeEl.textContent='—';
    confidenceEl.textContent=currentLanguage==='en'?'No benchmark':'Benchmark yok';
    sourcesEl.textContent='—';
    noteEl.textContent=currentLanguage==='en'
      ? 'Calculate the route or save a valid forwarder quote first.'
      : 'Önce rotayı hesaplayın veya geçerli bir forwarder teklifi kaydedin.';
    return null;
  }

  const seq=++freightBenchmarkSeq;
  confidenceEl.textContent=currentLanguage==='en'?'Calculating…':'Hesaplanıyor…';

  const usdTolls=Number(lastRouteData?.tollTotals?.USD)||0;
  const quoteSamples=matches.map(q=>({
    value:Number(q.rate),
    date:q.date,
    validUntil:q.validUntil||null,
    sourceType:'QUOTE',
    sourceName:q.provider||'Forwarder',
    currency:'USD'
  }));

  try{
    const res=await fetch('/api/freight-benchmark',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        workspaceId,
        origin:document.querySelector('#origin').value.trim(),
        destination:document.querySelector('#destination').value.trim(),
        originCountry:document.querySelector('#exportCountry').value||null,
        destinationCountry:document.querySelector('#importCountry').value||null,
        countryOfOrigin:document.querySelector('#originCountry').value||null,
        transitCountries:parseTransitCountries().codes||[],
        equipment:document.querySelector('#containerType').value,
        transportMode:document.querySelector('#transportMode').value,
        distanceKm:lastRouteData?.distanceKm??null,
        units:Number(document.querySelector('#containerCount').value)||1,
        currency:'USD',
        commercialBufferPct:Number(document.querySelector('#commercialBuffer').value)||0,
        tollsPerUnit:usdTolls,
        borderFeesPerUnit:0,
        quoteSamples,
        marketSamples:[],
        perKmBenchmarks:[]
      })
    });
    const data=await res.json();
    if(seq!==freightBenchmarkSeq) return null;
    if(!res.ok) throw new Error(data?.message||data?.error||'Benchmark failed');

    const r=data.result;
    if(r.status!=='BENCHMARK_READY'){
      expectedEl.textContent='—';
      rangeEl.textContent='—';
      confidenceEl.textContent=currentLanguage==='en'?'No benchmark':'Benchmark yok';
      sourcesEl.textContent='—';
      noteEl.textContent=currentLanguage==='en'
        ? 'No quote or market benchmark is available. No freight price was invented.'
        : 'Teklif veya piyasa benchmark verisi yok. Sistem navlun fiyatı uydurmadı.';
      return r;
    }

    expectedEl.textContent='$'+money(r.expectedPerUnit,0)+' / '+(currentLanguage==='en'?'unit':'birim');
    rangeEl.textContent='$'+money(r.lowPerUnit,0)+' – $'+money(r.highPerUnit,0);
    confidenceEl.textContent=(currentLanguage==='en'
      ? {HIGH:'High',MEDIUM:'Medium',LOW:'Low'}[r.confidence]
      : {HIGH:'Yüksek',MEDIUM:'Orta',LOW:'Düşük'}[r.confidence])+' · '+r.confidencePct+'%';
    sourcesEl.textContent=(r.sourceMix||[]).map(x=>freightSourceLabel(x.sourceType)+' × '+x.count).join(' + ')||'—';
    const historyStatus=data.historyPersistence;
    noteEl.textContent=data.historicalFallback
      ? (currentLanguage==='en'
        ? 'No direct quote was available; a recent D1 historical benchmark was used as a low-confidence fallback.'
        : 'Doğrudan teklif bulunmadığı için yakın tarihli D1 geçmiş benchmark düşük güvenli fallback olarak kullanıldı.')
      : historyStatus?.attempted && historyStatus?.persisted
        ? (currentLanguage==='en'
          ? `Benchmark uses ${r.sampleCount} evidence item(s) and was saved to D1 history.`
          : `Benchmark ${r.sampleCount} veri noktasına dayanıyor ve D1 geçmişine kaydedildi.`)
        : historyStatus?.reason==='RECENT_IDENTICAL_BENCHMARK_EXISTS'
          ? (currentLanguage==='en'
            ? 'An identical recent benchmark already exists in D1; duplicate history write was skipped.'
            : 'Aynı benchmark D1 geçmişinde zaten bulunduğu için mükerrer kayıt atlandı.')
        : historyStatus?.attempted && !historyStatus?.persisted
          ? (currentLanguage==='en'
            ? `Benchmark calculated, but D1 history write failed: ${historyStatus.error||historyStatus.reason||'unknown'}`
            : `Benchmark hesaplandı ancak D1 geçmiş kaydı başarısız: ${historyStatus.error||historyStatus.reason||'bilinmiyor'}`)
          : (currentLanguage==='en'
            ? `Benchmark uses ${r.sampleCount} evidence item(s). Route/toll extras and the commercial buffer are applied separately.`
            : `Benchmark ${r.sampleCount} veri noktasına dayanıyor. Rota/toll ekleri ve ticari koruma payı ayrı uygulanıyor.`);
    return r;
  }catch{
    if(seq!==freightBenchmarkSeq) return null;
    expectedEl.textContent='—';
    rangeEl.textContent='—';
    confidenceEl.textContent=currentLanguage==='en'?'Unavailable':'Alınamadı';
    sourcesEl.textContent='—';
    noteEl.textContent=currentLanguage==='en'?'Freight benchmark could not be calculated.':'Navlun benchmark hesaplanamadı.';
    return null;
  }
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
  const equipmentLabel=currentLanguage==='en'?'equipment':'ekipman';
  document.querySelector('#matchedQuoteAverage').textContent=avg?'$'+money(avg,0)+' / '+equipmentLabel:'—';
  document.querySelector('#latestQuoteValue').textContent=latest?'$'+money(latest.rate,0)+' / '+equipmentLabel:'—';
  document.querySelector('#quoteDataStatus').textContent=currentLanguage==='en'
    ? (matches.length>=3?'Strong data':matches.length===2?'Moderate data':matches.length===1?'Single quote':'No data')
    : (matches.length>=3?'Güçlü veri':matches.length===2?'Orta veri':matches.length===1?'Tek teklif':'Veri yok');

  const list=document.querySelector('#quoteList');
  list.innerHTML=matches.slice(0,6).map(q=>`
    <div class="quote-item">
      <div><strong>${q.provider||'Forwarder'}</strong><span>${q.date} · ${q.containerType}</span></div>
      <b>$${money(q.rate,0)}</b>
      <button data-id="${q.id}" type="button">Sil</button>
    </div>`).join('') || (currentLanguage==='en'?'<p class="empty">No valid saved quote exists for this route and container type.</p>':'<p class="empty">Bu rota ve konteyner tipi için kayıtlı geçerli teklif yok.</p>');
  list.querySelectorAll('button[data-id]').forEach(btn=>btn.addEventListener('click',async()=>{
    const id=btn.dataset.id;
    saveQuotes(loadQuotes().filter(q=>q.id!==id));
    renderQuoteSummary();
    await deleteQuoteFromD1(id);
  }));
  loadFreightBenchmark();
}
document.querySelector('#quoteDate').value=todayISO();
document.querySelector('#saveQuote').addEventListener('click',()=>{
  const provider=document.querySelector('#quoteProvider').value.trim();
  const rate=positive('#quoteRate');
  const date=document.querySelector('#quoteDate').value||todayISO();
  const validUntil=document.querySelector('#quoteValidUntil').value||null;
  if(!rate){alert(currentLanguage==='en'?'Enter the quote amount.':'Teklif tutarını girin.');return}
  const quotes=loadQuotes();
  quotes.push({
    id:String(Date.now()),
    provider,
    rate,
    date,
    validUntil,
    origin:document.querySelector('#origin').value,
    destination:document.querySelector('#destination').value,
    containerType:document.querySelector('#containerType').value,
    transportMode:document.querySelector('#transportMode').value,
    countryOfOrigin:document.querySelector('#originCountry').value||null,
    exportCountry:document.querySelector('#exportCountry').value||null,
    importCountry:document.querySelector('#importCountry').value||null,
    transitCountries:parseTransitCountries().codes||[]
  });
  saveQuotes(quotes);
  document.querySelector('#quoteRate').value='';
  renderQuoteSummary();
  persistQuoteToD1(quotes[quotes.length-1]).then(saved=>{
    if(saved){saveQuotes(quotes);renderQuoteSummary()}
  });
});
document.querySelector('#applyQuoteAverage').addEventListener('click',()=>{
  const matches=matchingQuotes();
  const avg=weightedQuoteAverage(matches);
  if(!avg){alert(currentLanguage==='en'?'No valid quote was found for this route.':'Bu rota için geçerli teklif bulunamadı.');return}
  const freight=[...document.querySelectorAll('.cost-row')].find(r=>/uluslararası navlun|international freight|freight/i.test(r.querySelector('.label').value));
  if(!freight){alert(currentLanguage==='en'?'International freight row was not found.':'Uluslararası navlun satırı bulunamadı.');return}
  freight.querySelector('.rate').value=Math.round(avg);
  freight.querySelector('.source').value=matches.length===1?'QUOTE':'MARKET_AVG';
  refreshCalculatedAmounts();
});
renderQuoteSummary();
hydrateQuotesFromD1();
loadCalculationHistory();
document.querySelector('#refreshCalculationHistory').addEventListener('click',loadCalculationHistory);
document.querySelector('#clearCalculationHistory').addEventListener('click',async()=>{
  const ok=confirm(currentLanguage==='en'
    ? 'Delete all calculation history for this workspace permanently?'
    : 'Bu çalışma alanındaki tüm hesaplama geçmişi kalıcı olarak silinsin mi?');
  if(!ok) return;
  try{
    await deleteCalculationHistory();
    await loadCalculationHistory();
  }catch{
    alert(currentLanguage==='en'?'Calculation history could not be deleted.':'Hesaplama geçmişi silinemedi.');
  }
});

document.querySelector('#calculate').addEventListener('click',()=>{
  const notice=document.querySelector('#historySnapshotNotice');
  const incotermCheck=incotermAnalysis();
  if(!incotermCheck.compatible){
    alert(currentLanguage==='en'
      ? 'The selected Incoterm is not compatible with this transport-mode model.'
      : 'Seçilen Incoterm bu taşıma modu modeliyle uyumlu değil.');
    return;
  }
  if(incotermCheck.duplicates.length){
    alert(currentLanguage==='en'
      ? 'Potential Incoterm double count detected: '+incotermCheck.duplicates.join(', ')+'. Remove or zero items already included in the supplier price before calculating.'
      : 'Olası Incoterm çifte sayımı tespit edildi: '+incotermCheck.duplicates.join(', ')+'. Hesaplamadan önce tedarikçi fiyatına dahil kalemleri kaldırın veya sıfırlayın.');
    return;
  }
  if(notice) notice.hidden=true;
  const s=shipment();
  const price=positive('#price');
  if(!s.count||!s.payload||!price){alert(currentLanguage==='en'?'Check container count, net payload and purchase price.':'Konteyner sayısı, net yük ve alış fiyatını kontrol edin.');return}

  const originCountry=document.querySelector('#originCountry').value;
  const exportCountry=document.querySelector('#exportCountry').value;
  const importCountry=document.querySelector('#importCountry').value;
  if(!originCountry||!exportCountry||!importCountry){
    alert(currentLanguage==='en'
      ? 'Select country of origin, export country and import country.'
      : 'Menşe ülkesi, ihracat ülkesi ve ithalat ülkesini seçin.');
    return;
  }

  const transit=parseTransitCountries();
  if(transit.invalid?.length){
    alert(currentLanguage==='en'
      ? 'Invalid transit country code(s): '+transit.invalid.join(', ')
      : 'Geçersiz transit ülke kodu/kodları: '+transit.invalid.join(', '));
    document.querySelector('#transitCountries').focus();
    return;
  }

  const goods=goodsTotal();
  const customsValuation=customsValuationValues();
  const costRows=[...document.querySelectorAll('.cost-row')];
  const dutyRow=findDutyRow();
  if(dutyRow && String(dutyRow.querySelector('.rate').value).trim()!==''){
    if(customsValuation.status!=='VERIFIED'){
      alert(currentLanguage==='en'
        ? 'Customs value is not verified. Verify the destination-country customs valuation treatment before calculating duty.'
        : 'Gümrük kıymeti doğrulanmadı. Gümrük vergisini hesaplamadan önce hedef ülkenin gümrük kıymeti uygulamasını doğrulayın.');
      document.querySelector('#customsValuationStatus').focus();
      return;
    }
  }
  if(dutyRow && /doğrulanacak|to be verified/i.test(dutyRow.querySelector('.label').value)){
    const dutyRateRaw=dutyRow.querySelector('.rate').value.trim();
    const dutySource=dutyRow.querySelector('.source').value;
    const manuallyVerified=dutyRateRaw!=='' && dutySource==='MANUAL';
    if(!manuallyVerified){
      alert(currentLanguage==='en'
        ? 'Import duty is unresolved. Retrieve an official tariff or enter the verified rate manually and set the source to Manual data before calculating.'
        : 'İthalat gümrük vergisi doğrulanmadı. Hesaplamadan önce resmî tarifeyi alın veya doğruladığınız oranı manuel girip kaynağı Manuel veri olarak seçin.');
      dutyRow.querySelector('.rate').focus();
      return;
    }
  }
  const importTaxRow=findImportTaxRow();
  if(importTaxRow && /doğrulanacak|to be verified/i.test(importTaxRow.querySelector('.label').value)){
    const taxRateRaw=importTaxRow.querySelector('.rate').value.trim();
    const taxSource=importTaxRow.querySelector('.source').value;
    const manuallyVerified=taxRateRaw!=='' && ['MANUAL','OFFICIAL','LIVE'].includes(taxSource);
    if(!manuallyVerified){
      alert(currentLanguage==='en'
        ? 'Import VAT/local tax is unresolved. Enter the verified destination-country rate manually and set the source to Manual data, or remove this row when the tax is not part of the landed-cost scenario.'
        : 'İthalat KDV/yerel vergi doğrulanmadı. Hedef ülke için doğruladığınız oranı manuel girip kaynağı Manuel veri olarak seçin; bu vergi landed-cost senaryosuna dahil değilse satırı kaldırın.');
      importTaxRow.querySelector('.rate').focus();
      return;
    }
  }
  const remedyRows=costRows.filter(row=>/^REMEDY_/.test(row.dataset.code||''));
  const currentRemedyKey=currentTradeRemedyKey();
  const invalidRemedy=remedyRows.find(row=>{
    const rateRaw=row.querySelector('.rate').value.trim();
    const source=row.querySelector('.source').value;
    return !row.dataset.remedyReference
      || row.dataset.remedyKey!==currentRemedyKey
      || rateRaw===''
      || !['MANUAL','OFFICIAL','LIVE'].includes(source);
  });
  if(invalidRemedy){
    alert(currentLanguage==='en'
      ? 'A trade-remedy row is missing verification or no longer matches the current HS/origin/import route. Remove and re-add it after verification.'
      : 'Bir ticaret önlemi satırı doğrulama bilgisi eksik veya mevcut HS/menşe/ithalat rotasıyla artık eşleşmiyor. Doğruladıktan sonra kaldırıp yeniden ekleyin.');
    invalidRemedy.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const customsBasedRemedy=remedyRows.find(row=>row.dataset.remedyBasis==='CUSTOMS_VALUE_PERCENT');
  if(customsBasedRemedy && customsValuation.status!=='VERIFIED'){
    alert(currentLanguage==='en'
      ? 'Customs value must be verified before customs-value-based trade remedies can be calculated.'
      : 'Gümrük kıymeti bazlı ticaret önlemleri hesaplanmadan önce gümrük kıymeti doğrulanmalıdır.');
    document.querySelector('#customsValuationStatus').focus();
    return;
  }

  const unresolvedAdditionalTax=costRows.find(row=>
    /^TAX_/.test(row.dataset.code||'') &&
    /doğrulanacak|to be verified/i.test(row.querySelector('.label').value)
  );
  if(unresolvedAdditionalTax){
    const rateRaw=unresolvedAdditionalTax.querySelector('.rate').value.trim();
    const source=unresolvedAdditionalTax.querySelector('.source').value;
    const verified=rateRaw!=='' && ['MANUAL','OFFICIAL','LIVE'].includes(source);
    if(!verified){
      alert(currentLanguage==='en'
        ? 'An additional import tax is still unresolved. Enter the verified value and source, or remove the row before calculating.'
        : 'Ek ithalat vergilerinden biri hâlâ doğrulanmadı. Hesaplamadan önce doğrulanmış değeri ve kaynağı girin veya satırı kaldırın.');
      unresolvedAdditionalTax.querySelector('.rate').focus();
      return;
    }
    unresolvedAdditionalTax.querySelector('.label').value=unresolvedAdditionalTax.querySelector('.label').value
      .replace(/\s*\((?:doğrulanacak|to be verified)\)\s*/i,'');
  }

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
  document.querySelector('#commercialStatus').textContent=currentLanguage==='en'?(risky?'Verification required':'Safer'):(risky?'Doğrulama gerekli':'Daha güvenli');
  document.querySelector('#commercialStatusMeta').textContent=currentLanguage==='en'?(risky?'Verify critical items before quoting':'Better coverage of real quotes/data'):(risky?'Teklif vermeden önce kritik kalemleri doğrula':'Gerçek teklif/veri kapsamı daha iyi');
  const riskMessage=document.querySelector('#riskMessage');
  riskMessage.className='risk-message '+(risky?'warning':'ok');
  riskMessage.textContent=risky
    ? (currentLanguage==='en'
      ? 'Estimated-data share or verified freight coverage is insufficient. Verify freight and critical customs items before issuing a commercial quote.'
      : 'Bu hesapta tahmini veri oranı veya doğrulanmış navlun verisi yetersiz. Ticari fiyat vermeden önce navlun ve kritik gümrük kalemlerini doğrulayın.')
    : (currentLanguage==='en'
      ? 'Verified data coverage is stronger in this scenario. Still check quote validity dates.'
      : 'Bu senaryoda doğrulanmış veri kapsamı daha güçlü. Yine de teklif geçerlilik tarihlerini kontrol edin.');

  document.querySelector('#breakdownText').innerHTML=`
    <span>Ürün</span><strong>$${money(goods,0)}</strong>
    <span>+</span><span>Ek maliyetler</span><strong>$${money(extra,0)}</strong>
    <span>=</span><span>Nihai toplam</span><strong>$${money(total,0)}</strong>`;
  document.querySelector('#range').textContent='$'+money(low,0)+' – $'+money(high,0);
  document.querySelector('#routeText').textContent=
    `${document.querySelector('#productName').value} · ${document.querySelector('#origin').value} → ${document.querySelector('#destination').value} · ${document.querySelector('#incoterm').value} · ${s.count} × ${document.querySelector('#containerType').value}`;
  const snapshotCostRows=costRows.map(row=>({
    label:row.querySelector('.label').value,
    method:row.querySelector('.method').value,
    rate:Number(row.querySelector('.rate').value)||0,
    source:row.querySelector('.source').value,
    code:row.dataset.code||'OTHER',
    remedy:/^REMEDY_/.test(row.dataset.code||'') ? {
      remedyType:row.dataset.remedyType||null,
      remedyBasis:row.dataset.remedyBasis||null,
      remedyReference:row.dataset.remedyReference||null,
      remedyKey:row.dataset.remedyKey||null
    } : null
  }));

  persistCalculationSnapshot({
    product:{name:document.querySelector('#productName').value,hsCode:document.querySelector('#hsCode').value},
    route:{
      origin:document.querySelector('#origin').value,
      destination:document.querySelector('#destination').value,
      originCountry:document.querySelector('#originCountry').value,
      originCountryIso2:selectedCountryIso2('#originCountry'),
      exportCountry:document.querySelector('#exportCountry').value,
      exportCountryIso2:selectedCountryIso2('#exportCountry'),
      transitCountries:transit.codes,
      importCountry:document.querySelector('#importCountry').value,
      importCountryIso2:selectedCountryIso2('#importCountry'),
      incoterm:document.querySelector('#incoterm').value
    },
    preferentialTariff:{
      eligibilityStatus:document.querySelector('#preferentialEligibility')?.value||'NOT_CONFIRMED',
      candidateRate:lastTariffData?.normalized?.preferentialCandidate?.rate??null,
      verifiedRate:document.querySelector('#verifiedPreferentialRate')?.value===''?null:Number(document.querySelector('#verifiedPreferentialRate')?.value),
      schemeReference:document.querySelector('#preferentialSchemeReference')?.value.trim()||null,
      appliedDecision:preferentialDecision()
    },
    customsValuation:{
      transactionValue:customsValuation.transactionValue,
      additions:customsValuation.additions,
      deductions:customsValuation.deductions,
      value:customsValuation.value,
      status:customsValuation.status,
      inputs:{
        freight:Number(document.querySelector('#cvFreight').value)||0,
        insurance:Number(document.querySelector('#cvInsurance').value)||0,
        packing:Number(document.querySelector('#cvPacking').value)||0,
        assists:Number(document.querySelector('#cvAssists').value)||0,
        royalties:Number(document.querySelector('#cvRoyalties').value)||0,
        sellingCommission:Number(document.querySelector('#cvSellingCommission').value)||0,
        otherAddition:Number(document.querySelector('#cvOtherAddition').value)||0,
        postImportTransport:Number(document.querySelector('#cvPostImportTransport').value)||0,
        otherDeduction:Number(document.querySelector('#cvOtherDeduction').value)||0
      }
    },
    routeProfile:{
      grossWeightKg:Number(document.querySelector('#grossWeightKg').value)||0,
      heightCm:Number(document.querySelector('#heightCm').value)||0,
      commercialBufferPct:bufferPct
    },
    shipment:{
      transportMode:document.querySelector('#transportMode').value,
      containerType:document.querySelector('#containerType').value,
      containerCount:s.count,
      payloadPerContainer:s.payload,
      netMt:s.mt
    },
    purchase:{price:Number(document.querySelector('#price').value)||0,priceUnit:document.querySelector('#priceUnit').value},
    costRows:snapshotCostRows
  },{
    currency:'USD',goodsTotal:goods,extraTotal:extra,total,range:{low,high},confidencePct:confidence,
    estimateSharePct:estimateShare,commercialBufferPct:bufferPct,safeTotal
  }).then(saved=>{if(saved) loadCalculationHistory()});

  document.querySelector('#results').hidden=false;
});


let hsSearchTimer=null;
let hsSearchSeq=0;

function setHsStatus(text,state=''){
  const el=document.querySelector('#hsStatus');
  el.textContent=text;
  el.dataset.state=state;
}

function hideHsSuggestions(){
  const box=document.querySelector('#hsSuggestions');
  box.hidden=true;
  box.replaceChildren();
}

function renderHsSuggestions(matches){
  const box=document.querySelector('#hsSuggestions');
  box.replaceChildren();

  if(!matches.length){
    const empty=document.createElement('div');
    empty.className='hs-empty';
    empty.textContent=msg('hsNoMatchLong');
    box.appendChild(empty);
    box.hidden=false;
    return;
  }

  for(const match of matches){
    const button=document.createElement('button');
    button.type='button';
    button.className='hs-suggestion';
    button.dataset.code=match.hsCode;

    const top=document.createElement('span');
    top.className='hs-suggestion-top';

    const code=document.createElement('strong');
    code.textContent=match.hsCode;

    const badge=document.createElement('em');
    badge.textContent=match.matchType==='CURATED_ALIAS'?msg('productMatch'):'HS 2022';

    top.append(code,badge);

    const desc=document.createElement('span');
    desc.className='hs-suggestion-desc';
    const localizedAlias=match.localizedLabels?.[currentLanguage]||match.aliasLabel;
    desc.textContent=localizedAlias
      ? `${localizedAlias} — ${match.description}`
      : match.description;

    button.append(top,desc);
    button.addEventListener('click',async()=>{
      document.querySelector('#hsCode').value=match.hsCode;
      hideHsSuggestions();
      await validateHsCode(match.hsCode);
    });

    box.appendChild(button);
  }

  box.hidden=false;
}

async function searchHsCandidates(query){
  const q=String(query||'').trim();
  if(q.length<2){
    hideHsSuggestions();
    setHsStatus(msg('hsGlobal'));
    return;
  }

  const seq=++hsSearchSeq;
  setHsStatus(msg('hsSearching'),'loading');

  try{
    const res=await fetch('/api/hs?q='+encodeURIComponent(q)+'&limit=8',{cache:'no-store'});
    const data=await res.json();
    if(seq!==hsSearchSeq) return;
    if(!res.ok) throw new Error(data?.message||data?.error||'HS araması başarısız');

    renderHsSuggestions(data.matches||[]);
    setHsStatus(
      data.matches?.length
        ? `${data.matches.length} HS6 adayı · HS2022`
        : msg('hsNoMatch'),
      data.matches?.length?'candidate':'warning'
    );
  }catch(error){
    if(seq!==hsSearchSeq) return;
    hideHsSuggestions();
    setHsStatus(msg('hsDataError'),'error');
  }
}

async function validateHsCode(code){
  if(!/^\d{6}$/.test(code)){
    setHsStatus(msg('hsSixDigits'),'warning');
    return null;
  }

  setHsStatus(msg('hsValidating'),'loading');
  try{
    const res=await fetch('/api/hs?code='+encodeURIComponent(code),{cache:'no-store'});
    const data=await res.json();
    if(!res.ok||!data.match) throw new Error();
    setHsStatus(currentLanguage==='en'?`${data.match.hsCode} validated · ${data.hsRevision||'HS2022'}`:`${data.match.hsCode} doğrulandı · ${data.hsRevision||'HS2022'}`,'verified');
    loadTariff();
    return data.match;
  }catch{
    setHsStatus(msg('hsInvalid'),'error');
    return null;
  }
}

const hsInput=document.querySelector('#hsCode');
hsInput.addEventListener('input',()=>{
  clearTimeout(hsSearchTimer);
  const value=hsInput.value.trim();
  hsSearchTimer=setTimeout(()=>searchHsCandidates(value),250);
});
hsInput.addEventListener('keydown',event=>{
  if(event.key==='Escape') hideHsSuggestions();
});
hsInput.addEventListener('blur',()=>{
  setTimeout(()=>{
    if(/^\d{6}$/.test(hsInput.value.trim())) validateHsCode(hsInput.value.trim());
  },150);
});

document.querySelector('#searchHsFromProduct').addEventListener('click',()=>{
  const product=document.querySelector('#productName').value.trim();
  if(product.length<2){
    setHsStatus(msg('productFirst'),'warning');
    return;
  }
  searchHsCandidates(product);
});

document.addEventListener('click',event=>{
  if(!event.target.closest('.hs-field')) hideHsSuggestions();
});

async function loadFx(){
  const button=document.querySelector('#refreshFx');
  const rateEl=document.querySelector('#fxRate');
  const metaEl=document.querySelector('#fxMeta');
  const base=document.querySelector('#fxBase').value.trim().toUpperCase();
  const quote=document.querySelector('#fxQuote').value.trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(base)||!/^[A-Z]{3}$/.test(quote)){
    rateEl.textContent=currentLanguage==='en'?'Invalid currency':'Geçersiz para birimi';metaEl.textContent=currentLanguage==='en'?'Example: USD, EUR, TRY':'Örnek: USD, EUR, TRY';return;
  }
  button.disabled=true;button.textContent=currentLanguage==='en'?'Loading…':'Yükleniyor…';
  try{
    const response=await fetch(`/api/fx?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`,{cache:'no-store'});
    if(!response.ok) throw new Error();
    const data=await response.json();
    rateEl.textContent=`1 ${base} = ${money(Number(data.rate),4)} ${quote}`;
    const dateText=data.date?new Intl.DateTimeFormat(currentLanguage==='en'?'en-US':'tr-TR',{dateStyle:'medium'}).format(new Date(data.date+'T12:00:00Z')):(currentLanguage==='en'?'Current':'Güncel');
    metaEl.textContent=`${dateText} · ${data.sourceName||'Referans kur'}`;
  }catch{rateEl.textContent=currentLanguage==='en'?'Exchange-rate data unavailable':'Kur verisi alınamadı';metaEl.textContent=currentLanguage==='en'?'The API connection is not active yet or deployment is incomplete.':'API bağlantısı henüz aktif değil veya deploy tamamlanmadı.'}
  finally{button.disabled=false;button.textContent=currentLanguage==='en'?'Refresh rate':'Kuru yenile'}
}
const languageSelect=document.querySelector('#languageSelect');
languageSelect.value=currentLanguage;
languageSelect.addEventListener('change',()=>applyLanguage(languageSelect.value));
translateStaticDocument();
updateCostLanguage();
updateCurrencyLanguage();

document.querySelector('#refreshTariff').addEventListener('click',loadTariff);
['preferentialEligibility','verifiedPreferentialRate','preferentialSchemeReference'].forEach(id=>{
  document.querySelector('#'+id)?.addEventListener('input',applyTariffSelection);
  document.querySelector('#'+id)?.addEventListener('change',applyTariffSelection);
});
document.querySelector('#refreshTaxRule').addEventListener('click',loadCountryTaxProfile);
document.querySelector('#applyVerifiedImportTax')?.addEventListener('click',applyVerifiedImportTaxRate);
document.querySelector('#addAdditionalImportTax')?.addEventListener('click',addSelectedImportTax);
document.querySelector('#checkTradeRemedySources')?.addEventListener('click',checkTradeRemedySources);
document.querySelector('#addTradeRemedy')?.addEventListener('click',addVerifiedTradeRemedy);
document.querySelector('#originCountry').addEventListener('change',()=>{loadTariff();refreshTradeRemedyValidity();});
document.querySelector('#exportCountry').addEventListener('change',()=>{});
document.querySelector('#importCountry').addEventListener('change',()=>{
  invalidateCustomsValuation();
  updateCustomsValuation();
  const taxSelect=document.querySelector('#taxRuleCountrySelect');
  if(taxSelect) taxSelect.value=document.querySelector('#importCountry').value;
  loadTariff();
  loadCountryTaxProfile();
  refreshTradeRemedyValidity();
});
document.querySelector('#taxRuleCountrySelect').addEventListener('change',()=>{
  invalidateCustomsValuation();
  updateCustomsValuation();
  const importSelect=document.querySelector('#importCountry');
  importSelect.value=document.querySelector('#taxRuleCountrySelect').value;
  loadTariff();
  loadCountryTaxProfile();
  renderQuoteSummary();
});

document.querySelector('#refreshFx').addEventListener('click',loadFx);
['fxBase','fxQuote'].forEach(id=>document.querySelector('#'+id).addEventListener('change',loadFx));
loadFx();

async function calculateRoute(){
  const btn=document.querySelector('#calculateRoute');
  const mode=document.querySelector('#transportMode').value;
  if(mode!=='ROAD'){
    lastRouteData=null;
    document.querySelector('#routeDistance').textContent='—';
    document.querySelector('#routeDuration').textContent='—';
    document.querySelector('#routeTolls').textContent='—';
    document.querySelector('#routeStatus').textContent=currentLanguage==='en'
      ? 'Route provider not connected for '+mode
      : mode+' için rota sağlayıcısı bağlı değil';
    loadFreightBenchmark();
    return;
  }
  btn.disabled=true;btn.textContent=currentLanguage==='en'?'Calculating…':'Hesaplanıyor…';document.querySelector('#routeStatus').textContent=currentLanguage==='en'?'Loading':'Yükleniyor';
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
        document.querySelector('#routeStatus').textContent=currentLanguage==='en'?'API key required':'API anahtarı gerekli';
        document.querySelector('#routeDistance').textContent='—';
        document.querySelector('#routeDuration').textContent='—';
        document.querySelector('#routeTolls').textContent='—';
        return;
      }
      throw new Error();
    }
    lastRouteData=data;
    document.querySelector('#routeDistance').textContent=money(data.distanceKm,0)+' km';
    document.querySelector('#routeDuration').textContent=money(data.durationHours,1)+' saat';
    const tollEntries=Object.entries(data.tollTotals||{});
    document.querySelector('#routeTolls').textContent=tollEntries.length
      ? tollEntries.map(([c,v])=>money(v,2)+' '+c).join(' + ')
      : (data.tollDataAvailable ? (currentLanguage==='en'?'No toll / no data':'Yol ücreti yok / veri yok') : (currentLanguage==='en'?'Unavailable from free source':'Ücretsiz kaynakta yok'));
    document.querySelector('#routeStatus').textContent=currentLanguage==='en'?(data.truckProfileApplied?'Verified truck route':'Free route estimate'):(data.truckProfileApplied?'Doğrulanmış kamyon rotası':'Ücretsiz rota tahmini');
    loadFreightBenchmark();
  }catch{document.querySelector('#routeStatus').textContent=currentLanguage==='en'?'Route unavailable':'Rota alınamadı'}
  finally{btn.disabled=false;btn.textContent=currentLanguage==='en'?'Calculate route':'Rotayı hesapla'}
}
document.querySelector('#calculateRoute').addEventListener('click',calculateRoute);
document.querySelector('#incoterm').addEventListener('change',()=>{
  invalidateCustomsValuation();
  updateCustomsValuation();
  updateIncotermStatus();
});
document.querySelector('#transportMode').addEventListener('change',()=>{
  lastRouteData=null;
  document.querySelector('#routeDistance').textContent='—';
  document.querySelector('#routeDuration').textContent='—';
  document.querySelector('#routeTolls').textContent='—';
  document.querySelector('#routeStatus').textContent=currentLanguage==='en'?'Recalculate / verify route':'Rotayı yeniden hesapla / doğrula';
  renderQuoteSummary();
  updateIncotermStatus();
});
document.querySelector('#refreshFreightBenchmark').addEventListener('click',loadFreightBenchmark);
document.querySelector('#commercialBuffer').addEventListener('input',()=>loadFreightBenchmark());


function buildPrintReport(){
  const s=shipment();
  const get=id=>document.querySelector(id)?.textContent?.trim()||'—';
  document.querySelector('#printDate').textContent=new Intl.DateTimeFormat(currentLanguage==='en'?'en-US':'tr-TR',{dateStyle:'long',timeStyle:'short'}).format(new Date());
  document.querySelector('#printProduct').textContent=document.querySelector('#productName').value||'—';
  document.querySelector('#printHs').textContent=document.querySelector('#hsCode').value||'—';
  document.querySelector('#printOriginCountry').textContent=selectedCountryName('#originCountry');
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
    alert(currentLanguage==='en'?'Calculate the cost first.':'Önce maliyeti hesaplayın.');
    return;
  }
  buildPrintReport();
  window.print();
});


['cvFreight','cvInsurance','cvPacking','cvAssists','cvRoyalties','cvSellingCommission','cvOtherAddition','cvPostImportTransport','cvOtherDeduction']
  .forEach(id=>document.querySelector('#'+id)?.addEventListener('input',()=>{
    if(document.querySelector('#customsValuationStatus').value==='VERIFIED'){
      document.querySelector('#customsValuationStatus').value='WORKING';
    }
    updateCustomsValuation();
  }));
document.querySelector('#customsValuationStatus')?.addEventListener('change',updateCustomsValuation);
document.querySelector('#price')?.addEventListener('input',()=>{
  if(document.querySelector('#customsValuationStatus').value==='VERIFIED'){
    document.querySelector('#customsValuationStatus').value='WORKING';
  }
  updateCustomsValuation();
});
document.querySelector('#priceUnit')?.addEventListener('change',()=>{
  if(document.querySelector('#customsValuationStatus').value==='VERIFIED'){
    document.querySelector('#customsValuationStatus').value='WORKING';
  }
  updateCustomsValuation();
});
updateCustomsValuation();

document.querySelector('#hsCode')?.addEventListener('input',refreshTradeRemedyValidity);
refreshTradeRemedyValidity();
