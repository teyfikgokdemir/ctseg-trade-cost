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
