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
