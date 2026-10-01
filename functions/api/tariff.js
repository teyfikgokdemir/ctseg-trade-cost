import { fetchWtoIndicators, fetchWtoTimeseries } from "../../packages/providers/src/wto.js";

const ALLOWED_DATA_PARAMS = new Set([
  "i","r","p","ps","pc","spc","fmt","mode","dec","off","max","head","lang"
]);

function pickWtoParams(searchParams) {
  const out = {};
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_DATA_PARAMS.has(key)) out[key] = value;
  }
  return out;
}

function json(body, status = 200, cache = "public, max-age=21600") {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cache }
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.WTO_API_KEY) {
    return json({
      error: "WTO API is not configured",
      code: "WTO_API_KEY_MISSING"
    }, 503, "no-store");
  }

  const url = new URL(request.url);
  const action = (url.searchParams.get("action") || "data").toLowerCase();

  try {
    if (action === "indicators") {
      const data = await fetchWtoIndicators(env.WTO_API_KEY);
      return json({
        provider: "wto-timeseries-v1",
        sourceType: "OFFICIAL",
        sourceName: "World Trade Organization",
        updatedAt: new Date().toISOString(),
        action: "indicators",
        data
      }, 200, "public, max-age=86400");
    }

    const params = pickWtoParams(url.searchParams);

    if (!params.i) {
      return json({
        error: "WTO indicator parameter 'i' is required",
        hint: "Use /api/tariff?action=indicators to discover official WTO indicator codes."
      }, 400, "no-store");
    }

    const data = await fetchWtoTimeseries(env.WTO_API_KEY, params);

    return json({
      provider: "wto-timeseries-v1",
      sourceType: "OFFICIAL",
      sourceName: "World Trade Organization",
      retrievedAt: new Date().toISOString(),
      request: params,
      data,
      disclaimer: "Official WTO statistical data. Tariff values may reflect a specific reporting year, HS revision or aggregation level; do not treat them as a current executable customs assessment without country-level verification."
    });
  } catch (error) {
    return json({
      error: "WTO tariff request failed",
      message: error instanceof Error ? error.message : String(error),
      detail: error?.detail || null
    }, 502, "no-store");
  }
}
