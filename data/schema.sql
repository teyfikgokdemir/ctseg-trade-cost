CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE market_quotes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  origin_country TEXT NOT NULL,
  origin_city TEXT,
  destination_country TEXT NOT NULL,
  destination_city TEXT,
  transport_mode TEXT NOT NULL,
  equipment TEXT,
  commodity TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT,
  quoted_at TEXT NOT NULL,
  valid_until TEXT,
  actual_paid REAL,
  metadata_json TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE tariff_records (
  id TEXT PRIMARY KEY,
  origin_country TEXT,
  destination_country TEXT NOT NULL,
  country_of_origin TEXT,
  hs_code TEXT NOT NULL,
  duty_rate REAL,
  vat_rate REAL,
  excise_rate REAL,
  source_url TEXT,
  effective_from TEXT,
  verified_at TEXT,
  metadata_json TEXT
);

CREATE TABLE calculations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  input_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
