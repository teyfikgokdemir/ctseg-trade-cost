# Data source architecture

The platform does not treat all numbers as equal.

## Priority
1. LIVE — transactional/current API or carrier price
2. OFFICIAL — customs/tariff/authority source
3. QUOTE — dated carrier/supplier/forwarder quotation
4. MARKET_AVG — recent observed market sample
5. MANUAL — user-entered verified value
6. ESTIMATE — model-derived fallback

## Required metadata
Every market value should carry:
- source type
- source name
- source URL or quote reference when available
- updated timestamp
- validity date when applicable
- unit/currency
- uncertainty range
- route/product/equipment metadata

## Planned adapters
- FX
- fuel
- routing/distance/tolls
- road freight
- ocean freight
- air freight
- customs/tariffs
- port/terminal charges
- insurance
- brokerage
- user/forwarder quote ingestion

No placeholder value may be surfaced as LIVE or OFFICIAL.


## WTO Timeseries API v1
- Provider id: `wto-timeseries-v1`
- Authentication: Cloudflare secret `WTO_API_KEY`
- Endpoint: `/api/tariff`
- Indicator discovery: `/api/tariff?action=indicators`
- Data calls pass documented WTO Timeseries query parameters through to `/timeseries/v1/data`.
- WTO tariff observations are tagged `OFFICIAL`, but the application must retain reporting year, HS revision, aggregation level and source metadata.
- An official historical/statistical observation is not automatically a current executable customs assessment.


## WITS / UNCTAD TRAINS HS metadata
- Provider id: `wits-unctad-trains`
- Authentication: none for metadata endpoints
- Endpoint: `/api/hs`
- Exact lookup: `/api/hs?code=010110`
- Candidate text search: `/api/hs?q=threonine`
- Results are classification candidates only; HS revision and importing-country national tariff-line verification are still required.
- Product metadata originates from the WITS UNCTAD TRAINS product metadata endpoint and is cached at the edge.


## UN Statistics Division / UN Comtrade HS 2022
- Provider id: `un-comtrade-hs2022`
- Official reference file: `https://comtradeapi.un.org/files/v1/app/reference/H6.json`
- This reference is linked from the United Nations Statistics Division classifications page for HS 2022.
- Primary endpoint: `/api/hs`
- Exact lookup: `/api/hs?code=292250`
- Text/candidate lookup: `/api/hs?q=threonine`
- Optional secondary WITS check: `/api/hs?code=292250&verify=wits`
- HS 2022 is the primary international classification reference. Country-specific national tariff lines remain authoritative for a binding declaration.


## WTO HS tariff lookup
- Endpoint: `/api/tariff?action=lookup`
- Required: `hs` (6 digits), `reporter` (3-digit WTO/UN economy code)
- Optional: `partner` (3-digit origin/partner code), `year` (YYYY)
- Example China -> Türkiye L-Threonine:
  `/api/tariff?action=lookup&hs=292250&reporter=792&partner=156&year=2025`
- Queries are sequenced to respect the WTO Standard product's 1 call/second limit for timeseries data.
- Returned indicators:
  - `HS_A_0010` MFN simple average ad valorem duty
  - `HS_A_0020` MFN maximum ad valorem duty
  - `HS_P_0070` partner-specific lowest preferential tariff observation
- Preferential observations do not by themselves establish eligibility; origin rules and the applicable arrangement still need confirmation.


## Global tax engine / Türkiye rule pack
- Tax lines are country adapters feeding the global landed-cost engine; tax law is not hard-coded into the core.
- Generic percentage tax bases use `calc: pct_codes` with explicit dependent cost codes.
- Non-cash/deferred tax lines can set `affectsLandedCost: false`.
- Türkiye modes:
  - `NORMAL_PURCHASE`
  - `EXPORT_REGISTERED`
  - `IMPORT_VAT`
- API: `/api/tax?country=TR&mode=IMPORT_VAT`
- Optional verified product rate: `&rate=10`
- If a verified rate is not supplied, the Türkiye adapter uses the general 20% VAT rate only as a marked fallback: `GENERAL_RATE_FALLBACK`, `requiresRateVerification=true`.
- Export-registered VAT is calculated for invoice/audit visibility but excluded from cash landed cost when the statutory conditions are met.
- Import VAT base includes customs value and resolved import taxes/charges represented by the configured base codes.


## Interface localization and multilingual HS search
- UI languages: Turkish (`tr`) and English (`en`), persisted locally per browser.
- HS codes remain canonical/global; interface language never changes the HS identifier.
- HS search accepts English catalog terms plus curated multilingual aliases.
- Turkish normalization handles `ç, ğ, ı, ö, ş, ü` before search.
- Initial Turkish aliases include L-threonine/treonin, sunflower oil/ayçiçek yağı, and almonds/badem.
- Ambiguous product aliases may deliberately return multiple HS6 candidates; the user must select the appropriate product presentation before tariff calculation.
- Official UN HS2022 descriptions remain available in English; localized labels are presentation/search aids only.


## Freight Benchmark Engine v1
- Endpoint: `POST /api/freight-benchmark`
- Produces a range, not a single unsupported freight price.
- Evidence hierarchy:
  - recent forwarder/carrier quotes
  - market benchmark samples
  - explicitly supplied per-km benchmark samples
- Route extras such as tolls and border fees are applied separately.
- Commercial buffer is applied after the benchmark and route extras.
- If no evidence exists, the engine returns `NO_BENCHMARK` and does not invent a rate.
- UI currently feeds same-route/equipment forwarder quotes plus route distance. External IRU/FBX-style benchmark adapters are planned as the next evidence sources.


## D1 active cache and history layer
- WTO tariff lookup uses a D1 cache key composed of reporter, partner, HS6 and requested year.
- Tariff cache TTL is 7 days. Expired records trigger a fresh WTO lookup.
- Cache failures or a missing migration never block a fresh official WTO request.
- Freight benchmark results are persisted to D1 when they are built from direct evidence.
- A recent D1 freight benchmark may be used only when no direct quote/market/per-km evidence is available.
- Historical freight fallback is explicitly marked and is not re-persisted, preventing recursive self-reinforcement.
