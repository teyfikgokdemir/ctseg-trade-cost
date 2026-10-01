PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_quotes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  origin_country TEXT,
  origin_city TEXT NOT NULL,
  destination_country TEXT,
  destination_city TEXT NOT NULL,
  transport_mode TEXT NOT NULL DEFAULT 'ROAD',
  equipment TEXT NOT NULL,
  commodity TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  source_type TEXT NOT NULL DEFAULT 'QUOTE',
  source_name TEXT,
  quoted_at TEXT NOT NULL,
  valid_until TEXT,
  actual_paid REAL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_market_quotes_lookup
  ON market_quotes (tenant_id, origin_city, destination_city, equipment, quoted_at);

CREATE TABLE IF NOT EXISTS tariff_records (
  id TEXT PRIMARY KEY,
  origin_country TEXT,
  destination_country TEXT NOT NULL,
  country_of_origin TEXT,
  hs_code TEXT NOT NULL,
  hs_revision TEXT,
  tariff_type TEXT,
  duty_rate REAL,
  min_rate REAL,
  max_rate REAL,
  vat_rate REAL,
  excise_rate REAL,
  source_name TEXT,
  source_url TEXT,
  source_year INTEGER,
  data_status TEXT NOT NULL DEFAULT 'UNVERIFIED',
  effective_from TEXT,
  verified_at TEXT,
  retrieved_at TEXT,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_tariff_records_lookup
  ON tariff_records (destination_country, country_of_origin, hs_code, source_year);

CREATE TABLE IF NOT EXISTS calculations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  input_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_calculations_tenant_created
  ON calculations (tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS freight_benchmarks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  origin_country TEXT,
  origin_city TEXT,
  destination_country TEXT,
  destination_city TEXT,
  transport_mode TEXT NOT NULL,
  equipment TEXT,
  distance_km REAL,
  amount_per_unit REAL,
  currency TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT,
  source_date TEXT,
  valid_until TEXT,
  confidence_pct REAL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_freight_benchmarks_lookup
  ON freight_benchmarks (tenant_id, origin_city, destination_city, equipment, source_date);
