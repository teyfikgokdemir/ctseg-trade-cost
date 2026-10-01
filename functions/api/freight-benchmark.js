import { buildFreightBenchmark } from "../../packages/core/src/freight.js";
import { ensureTenant, normalizeWorkspaceId } from "../../packages/db/src/d1.js";

function normalizeRouteText(value) {
  return String(value || "").trim();
}

async function readHistoricalBenchmark(env, body) {
  if (!env?.DB || !body?.workspaceId || !body?.origin || !body?.destination || !body?.equipment) return null;

  const workspaceId = normalizeWorkspaceId(body.workspaceId);
  const row = await env.DB.prepare(`
    SELECT amount_per_unit, currency, confidence_pct, source_date, created_at, metadata_json
    FROM freight_benchmarks
    WHERE tenant_id = ?
      AND lower(origin_city) = lower(?)
      AND lower(destination_city) = lower(?)
      AND equipment = ?
      AND datetime(created_at) >= datetime('now', '-90 days')
    ORDER BY datetime(created_at) DESC
    LIMIT 1
  `).bind(
    workspaceId,
    normalizeRouteText(body.origin),
    normalizeRouteText(body.destination),
    String(body.equipment).trim()
  ).first();

  if (!row || !Number.isFinite(Number(row.amount_per_unit))) return null;

  return {
    value: Number(row.amount_per_unit),
    date: row.source_date || row.created_at,
    sourceType: "ESTIMATE",
    sourceName: "D1 historical freight benchmark",
    currency: row.currency || body.currency || "USD",
    confidencePct: Number(row.confidence_pct) || null
  };
}

async function writeBenchmarkHistory(env, body, result) {
  if (!env?.DB || !body?.workspaceId || result?.status !== "BENCHMARK_READY") return false;

  const workspaceId = normalizeWorkspaceId(body.workspaceId);
  await ensureTenant(env.DB, workspaceId);

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
    Number.isFinite(Number(body.distanceKm)) ? Number(body.distanceKm) : null,
    Number(result.expectedPerUnit),
    result.currency || body.currency || "USD",
    "DERIVED_BENCHMARK",
    "CTSEG Freight Benchmark Engine",
    new Date().toISOString(),
    body.validUntil || null,
    Number(result.confidencePct) || 0,
    JSON.stringify({
      result,
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

    if (!usedHistoricalFallback && result.status === "BENCHMARK_READY") {
      try {
        await writeBenchmarkHistory(env, body, result);
      } catch {
        // Persistence must not break benchmark calculation.
      }
    }

    return Response.json({
      provider: "ctseg-freight-benchmark-v1",
      sourceType: "COMPOSITE",
      generatedAt: new Date().toISOString(),
      historicalFallback: usedHistoricalFallback,
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
