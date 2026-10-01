import { calculateLandedCost, SourceType } from './engine.js';

const scenario = {
  currency: 'USD',
  product: { quantity: 100, unit: 'mt', densityKgPerL: 0.92 },
  purchase: { price: 1.80, priceUnit: 'usd/litre', sourceType: SourceType.QUOTE },
  costs: [
    { code: 'TRUCK_ORIGIN', label: 'Origin inland haulage', amount: 7200, sourceType: SourceType.MARKET_AVG, uncertaintyPct: 0.10 },
    { code: 'EXPORT_CLEARANCE', label: 'Export customs & docs', amount: 950, sourceType: SourceType.MARKET_AVG },
    { code: 'FREIGHT_INTL', label: 'International freight', amount: 22500, sourceType: SourceType.MARKET_AVG, uncertaintyPct: 0.12 },
    { code: 'INSURANCE', label: 'Cargo insurance', calc: 'pct_goods', rate: 0.35, sourceType: SourceType.QUOTE },
    { code: 'DESTINATION_FEES', label: 'Destination/border handling', amount: 4800, sourceType: SourceType.ESTIMATE },
    { code: 'DUTY', label: 'Import duty', calc: 'pct_goods', rate: 5, sourceType: SourceType.OFFICIAL },
    { code: 'BROKER', label: 'Customs broker', amount: 1300, sourceType: SourceType.MARKET_AVG },
    { code: 'DEST_INLAND', label: 'Destination inland haulage', amount: 6400, sourceType: SourceType.ESTIMATE },
    { code: 'FINANCE', label: 'Banking/finance', calc: 'pct_goods', rate: 0.8, sourceType: SourceType.ESTIMATE }
  ]
};

const result = calculateLandedCost(scenario);
console.log(JSON.stringify(result, null, 2));
