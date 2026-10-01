DELETE FROM freight_benchmarks
WHERE distance_km IS NULL OR distance_km <= 0;

DELETE FROM freight_benchmarks
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM freight_benchmarks
  GROUP BY
    tenant_id,
    lower(origin_city),
    lower(destination_city),
    equipment,
    ROUND(distance_km, 1),
    ROUND(amount_per_unit, 2),
    strftime('%Y-%m-%d %H:%M', created_at)
);
