import { buildFreightBenchmark } from "../../packages/core/src/freight.js";
import { ensureTenant, normalizeWorkspaceId } from "../../packages/db/src/d1.js";

function normalizeRouteText(value) {
  return String(value || "").trim();
}

async function readHistoricalBenchmark(env, body) {
  if (!env?.DB || !body?.workspaceId || !body?.equipment) return null;

  const workspaceId = normalizeWorkspaceId(body.workspaceId);
  const origin = normalizeRouteText(body.origin);
  const destination = normalizeRouteText(body.destination);
  const equipment = String(body.equipment).trim();
  const transportMode = String(body.transportMode || "ROAD").trim();

  let row = null;

  if (origin && destination) {
    row = await env.DB.prepare(`
      SELECT amount_per_unit, currency, confidence_pct, source_date, created_at, metadata_json,
             origin_city, destination_city, origin_country, destination_country, transport_mode
      FROM freight_benchmarks
      WHERE tenant_id = ?
        AND lower(origin_city) = lower(?)
        AND lower(destination_city) = lower(?)
        AND equipment = ?
        AND transport_mode = ?
        AND distance_km > 0
        AND datetime(created_at) >= datetime('now', '-90 days')
      ORDER BY datetime(created_at) DESC
      LIMIT 1
    `).bind(
      workspaceId,
      origin,
      destination,
      equipment,
      transportMode
    ).first();
  }

  if (!row && body.originCountry && body.destinationCountry) {
    row = await env.DB.prepare(`
      SELECT amount_per_unit, currency, confidence_pct, source_date, created_at, metadata_json,
             origin_city, destination_city, origin_country, destination_country, transport_mode
      FROM freight_benchmarks
      WHERE tenant_id = ?
        AND origin_country = ?
        AND destination_country = ?
        AND equipment = ?
        AND transport_mode = ?
        AND distance_km > 0
        AND datetime(created_at) >= datetime('now', '-90 days')
      ORDER BY datetime(created_at) DESC
      LIMIT 1
    `).bind(
      workspaceId,
      String(body.originCountry),
      String(body.destinationCountry),
      equipment,
      transportMode
    ).first();
  }

  if (!row || !Number.isFinite(Number(row.amount_per_unit))) return null;

  return {
    value: Number(row.amount_per_unit),
    date: row.source_date || row.created_at,
    sourceType: "ESTIMATE",
    sourceName: origin && destination
      ? "D1 historical route benchmark"
      : "D1 historical country-pair benchmark",
    currency: row.currency || body.currency || "USD",
    confidencePct: Number(row.confidence_pct) || null,
    metadata: {
      originCity: row.origin_city || null,
      destinationCity: row.destination_city || null,
      originCountry: row.origin_country || null,
      destinationCountry: row.destination_country || null,
      transportMode: row.transport_mode || transportMode,
      fallbackScope: origin && destination ? "ROUTE" : "COUNTRY_PAIR"
    }
  };
}

async function writeBenchmarkHistory(env, body, result) {
  if (!env?.DB || !body?.workspaceId || result?.status !== "BENCHMARK_READY") return false;

  const distanceKm = Number(body.distanceKm);
  const baseAmount = Number(result?.components?.benchmarkBasePerUnit);
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(baseAmount) || baseAmount <= 0) {
    return false;
  }

  const workspaceId = normalizeWorkspaceId(body.workspaceId);
  await ensureTenant(env.DB, workspaceId);

  const recent = await env.DB.prepare(`
    SELECT id
    FROM freight_benchmarks
    WHERE tenant_id = ?
      AND lower(origin_city) = lower(?)
      AND lower(destination_city) = lower(?)
      AND equipment = ?
      AND ABS(distance_km - ?) < 1
      AND ABS(amount_per_unit - ?) < 0.01
      AND datetime(created_at) >= datetime('now', '-10 minutes')
    LIMIT 1
  `).bind(
    workspaceId,
    normalizeRouteText(body.origin),
    normalizeRouteText(body.destination),
    String(body.equipment || "").trim(),
    distanceKm,
    baseAmount
  ).first();

  if (recent?.id) return "DEDUPED";

  await env.DB.prepare(`
    INSERT INTO freight_benchmarks (
      id, tenant_id, origin_country, origin_city, destination_country,
      destination_city, transport_mode, equipment, distance_km,
      amount_per_unit, currency, source_type, source_name, source_date,
      valid_until, confidence_pct, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    workspaceId,
    body.originCountry || null,
    normalizeRouteText(body.origin),
    body.destinationCountry || null,
    normalizeRouteText(body.destination),
    body.transportMode || "ROAD",
    String(body.equipment || "").trim() || null,
    distanceKm,
    baseAmount,
    result.currency || body.currency || "USD",
    "DERIVED_BENCHMARK",
    "CTSEG Freight Benchmark Engine",
    new Date().toISOString(),
    body.validUntil || null,
    Number(result.confidencePct) || 0,
    JSON.stringify({
      result,
      storedValueBasis: "UNBUFFERED_BENCHMARK_BASE",
      expectedPerUnitWithBuffer: result.expectedPerUnit,
      sourceMix: result.sourceMix || [],
      quoteCount: result.quoteCount || 0,
      marketSampleCount: result.marketSampleCount || 0,
      perKmBenchmarkCount: result.perKmBenchmarkCount || 0
    })
  ).run();

  return true;
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const directEvidenceCount =
      (Array.isArray(body.quoteSamples) ? body.quoteSamples.length : 0) +
      (Array.isArray(body.marketSamples) ? body.marketSamples.length : 0) +
      (Array.isArray(body.perKmBenchmarks) ? body.perKmBenchmarks.length : 0);

    let usedHistoricalFallback = false;
    if (directEvidenceCount === 0) {
      try {
        const historical = await readHistoricalBenchmark(env, body);
        if (historical) {
          body.marketSamples = [historical];
          usedHistoricalFallback = true;
        }
      } catch {
        // Historical lookup is optional and must not break calculation.
      }
    }

    const result = buildFreightBenchmark(body || {});

    let historyPersistence = {
      attempted: false,
      persisted: false,
      reason: usedHistoricalFallback ? "HISTORICAL_FALLBACK_NOT_REPERSISTED" : null,
      error: null
    };

    if (!usedHistoricalFallback && result.status === "BENCHMARK_READY") {
      historyPersistence.attempted = true;
      try {
        const persistenceResult = await writeBenchmarkHistory(env, body, result);
        if (persistenceResult === "DEDUPED") {
          historyPersistence.persisted = false;
          historyPersistence.reason = "RECENT_IDENTICAL_BENCHMARK_EXISTS";
        } else {
          historyPersistence.persisted = persistenceResult === true;
          if (!historyPersistence.persisted) {
            historyPersistence.reason = env?.DB
              ? "MISSING_ROUTE_DISTANCE_OR_METADATA"
              : "DB_NOT_CONFIGURED";
          }
        }
      } catch (error) {
        historyPersistence.error = error instanceof Error ? error.message : String(error);
      }
    }

    return Response.json({
      provider: "ctseg-freight-benchmark-v1",
      sourceType: "COMPOSITE",
      generatedAt: new Date().toISOString(),
      historicalFallback: usedHistoricalFallback,
      historyPersistence,
      result
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({
      error: "Freight benchmark calculation failed",
      message: error instanceof Error ? error.message : String(error)
    }, {
      status: 400,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
