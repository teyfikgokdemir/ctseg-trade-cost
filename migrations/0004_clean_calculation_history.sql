DELETE FROM calculations
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM calculations
  GROUP BY tenant_id, input_json, result_json
);
