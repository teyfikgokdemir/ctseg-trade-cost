const DEFAULT_TTL_HOURS = {
  LIVE: 6,
  OFFICIAL: 168,
  QUOTE: 720,
  MARKET_AVG: 168,
  MANUAL: 720,
  ESTIMATE: 168
};

export function ageHours(updatedAt, now = new Date()) {
  if (!updatedAt) return Infinity;
  const t = new Date(updatedAt).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return Math.max(0, (now.getTime() - t) / 3600000);
}

export function freshnessStatus(record, now = new Date()) {
  const sourceType = record.sourceType ?? 'ESTIMATE';
  const ttl = record.ttlHours ?? DEFAULT_TTL_HOURS[sourceType] ?? 168;
  const age = ageHours(record.updatedAt, now);
  if (!Number.isFinite(age)) return { status: 'UNKNOWN', ageHours: null, ttlHours: ttl };
  if (age <= ttl) return { status: 'FRESH', ageHours: age, ttlHours: ttl };
  if (age <= ttl * 2) return { status: 'AGING', ageHours: age, ttlHours: ttl };
  return { status: 'STALE', ageHours: age, ttlHours: ttl };
}

export function marketRecord({
  code,
  value,
  unit,
  sourceType,
  sourceName,
  sourceUrl = null,
  updatedAt,
  validUntil = null,
  uncertaintyPct = null,
  ttlHours = null,
  metadata = {}
}) {
  if (!code) throw new Error('code is required');
  if (!Number.isFinite(value)) throw new Error('value must be numeric');
  return {
    code, value, unit, sourceType, sourceName, sourceUrl, updatedAt,
    validUntil, uncertaintyPct, ttlHours, metadata
  };
}

export function selectBestRecord(records, { now = new Date() } = {}) {
  const quality = { LIVE: 6, OFFICIAL: 5, QUOTE: 4, MARKET_AVG: 3, MANUAL: 2, ESTIMATE: 1 };
  const ranked = records
    .map(r => ({ r, f: freshnessStatus(r, now) }))
    .filter(x => x.f.status !== 'STALE')
    .sort((a,b) => {
      const qa = quality[a.r.sourceType] ?? 0;
      const qb = quality[b.r.sourceType] ?? 0;
      if (qa !== qb) return qb - qa;
      return (a.f.ageHours ?? Infinity) - (b.f.ageHours ?? Infinity);
    });
  return ranked[0]?.r ?? null;
}

export function summarizeDataQuality(records, { now = new Date() } = {}) {
  const summary = { total: records.length, fresh: 0, aging: 0, stale: 0, unknown: 0 };
  for (const r of records) {
    const s = freshnessStatus(r, now).status.toLowerCase();
    summary[s] = (summary[s] ?? 0) + 1;
  }
  return summary;
}
