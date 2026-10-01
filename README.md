# Trade Cost Platform

Global landed-cost and trade-cost intelligence engine.

## Principles
- Route/country/product independent
- Multi-tenant from day one
- Every cost carries source type, update time and uncertainty
- Outputs total landed cost, per kg/MT/litre, expected range and confidence
- Live/official data should override estimates; manual overrides remain auditable

## Source hierarchy
1. LIVE
2. OFFICIAL
3. QUOTE
4. MARKET_AVG
5. MANUAL
6. ESTIMATE

## v0.1 included
- Unit normalization (kg/MT/litre)
- Purchase price normalization
- Cost lines and percentage-based costs
- Confidence-weighted result
- Low/high expected range
- Recency/quality weighted market-average helper with trimming
- Multi-tenant/data schema starter
- Demo scenario and tests

## Run
```bash
npm test
npm run demo
```

## Planned providers
- FX
- Fuel
- Road-route/tolls
- Ocean/air freight benchmarks
- Customs/tariff official sources
- Port/terminal charges
- User/forwarder quote ingestion

## Deployment target
- GitHub source repository
- Cloudflare Pages for web UI
- Cloudflare Workers for API/provider layer
- Cloudflare D1 for early-stage persistence
