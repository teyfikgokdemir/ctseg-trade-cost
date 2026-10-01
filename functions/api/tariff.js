import { fetchWtoIndicators, fetchWtoTimeseries } from "../../packages/providers/src/wto.js";

const ALLOWED_DATA_PARAMS = new Set([
  "i","r","p","ps","pc","spc","fmt","mode","dec","off","max","head","lang"
]);

const HS6 = /^\d{6}$/;
const ECONOMY3 = /^\d{3}$/;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function lookupTariffs(apiKey, { hs, reporter, partner, year }) {
  const base = {
    r: reporter,
    pc: hs,
    ps: year || "default",
    fmt: "json",
    mode: "full",
    max: "100",
    lang: "1"
  };

  const mfnAverage = await fetchWtoTimeseries(apiKey, {
    ...base,
    i: "HS_A_0010"
  });

  // WTO Standard product allows one timeseries data/data_count call per second.
  await sleep(1100);

  const mfnMaximum = await fetchWtoTimeseries(apiKey, {
    ...base,
    i: "HS_A_0020"
  });

  let preferential = null;
  if (partner) {
    await sleep(1100);
    preferential = await fetchWtoTimeseries(apiKey, {
      ...base,
      i: "HS_P_0070",
      p: partner
    });
  }

  return { mfnAverage, mfnMaximum, preferential };
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

    if (action === "lookup") {
      const hs = (url.searchParams.get("hs") || "").trim();
      const reporter = (url.searchParams.get("reporter") || "").trim();
      const partner = (url.searchParams.get("partner") || "").trim();
      const year = (url.searchParams.get("year") || "").trim();

      if (!HS6.test(hs)) {
        return json({ error: "hs must be exactly 6 digits" }, 400, "no-store");
      }
      if (!ECONOMY3.test(reporter)) {
        return json({ error: "reporter must be a 3-digit WTO/UN economy code" }, 400, "no-store");
      }
      if (partner && !ECONOMY3.test(partner)) {
        return json({ error: "partner must be a 3-digit WTO/UN economy code" }, 400, "no-store");
      }
      if (year && !/^\d{4}$/.test(year)) {
        return json({ error: "year must be YYYY" }, 400, "no-store");
      }

      const data = await lookupTariffs(env.WTO_API_KEY, { hs, reporter, partner, year });

      return json({
        provider: "wto-timeseries-v1",
        sourceType: "OFFICIAL",
        sourceName: "World Trade Organization",
        retrievedAt: new Date().toISOString(),
        action: "lookup",
        classification: {
          hs,
          hsLevel: 6
        },
        route: {
          reporter,
          partner: partner || null
        },
        requestedYear: year || "default/latest available",
        indicators: {
          mfnAverage: {
            code: "HS_A_0010",
            label: "HS MFN - Simple average ad valorem duty",
            data: data.mfnAverage
          },
          mfnMaximum: {
            code: "HS_A_0020",
            label: "HS MFN - Maximum ad valorem duty",
            data: data.mfnMaximum
          },
          preferential: partner ? {
            code: "HS_P_0070",
            label: "Lowest preferential tariff - simple average ad valorem tariff at HS 6-digit",
            data: data.preferential
          } : null
        },
        interpretation: {
          mfn: "MFN is the default WTO applied-tariff reference for this HS code/reporting economy.",
          preferential: partner
            ? "A preferential observation is partner-specific evidence only; eligibility still depends on the applicable trade arrangement and rules of origin."
            : "No partner was supplied, so no preferential-tariff query was made."
        },
        disclaimer: "Official WTO statistical tariff data is not a binding customs assessment. Confirm the importing country's current national tariff line, origin rules, taxes and other import charges before quoting a final landed cost."
      });
    }

    const params = pickWtoParams(url.searchParams);

    if (!params.i) {
      return json({
        error: "WTO indicator parameter 'i' is required",
        hint: "Use /api/tariff?action=indicators or /api/tariff?action=lookup&hs=292250&reporter=792&partner=156"
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
