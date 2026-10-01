ALTER TABLE tariff_records ADD COLUMN cache_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tariff_records_cache_key
  ON tariff_records (cache_key);

CREATE INDEX IF NOT EXISTS idx_tariff_records_retrieved
  ON tariff_records (retrieved_at);

CREATE INDEX IF NOT EXISTS idx_freight_benchmarks_recent
  ON freight_benchmarks (tenant_id, origin_city, destination_city, equipment, created_at DESC);
