import { fetchWitsProductByCode, searchWitsProducts } from "../../packages/providers/src/wits.js";

const HS6 = /^\d{6}$/;

function json(body, status = 200, cache = "public, max-age=86400") {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": cache }
  });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 10), 1), 25);

  if (!code && !q) {
    return json({
      error: "Provide ?code=XXXXXX or ?q=search text",
      examples: [
        "/api/hs?code=010110",
        "/api/hs?q=threonine"
      ]
    }, 400, "no-store");
  }

  try {
    if (code) {
      if (!HS6.test(code)) {
        return json({ error: "HS code must be exactly 6 digits" }, 400, "no-store");
      }

      const product = await fetchWitsProductByCode(code);
      return json({
        provider: "wits-unctad-trains",
        sourceType: "OFFICIAL",
        sourceName: "World Bank WITS / UNCTAD TRAINS",
        retrievedAt: new Date().toISOString(),
        query: { code },
        match: product,
        classificationStatus: product ? "CANDIDATE_FOUND" : "NOT_FOUND",
        disclaimer: "HS metadata is for classification support. Confirm the applicable HS revision and importing-country national tariff line before using a code for a binding customs declaration."
      });
    }

    if (q.length < 2) {
      return json({ error: "Search text must be at least 2 characters" }, 400, "no-store");
    }

    const matches = await searchWitsProducts(q, limit);
    return json({
      provider: "wits-unctad-trains",
      sourceType: "OFFICIAL",
      sourceName: "World Bank WITS / UNCTAD TRAINS",
      retrievedAt: new Date().toISOString(),
      query: { q, limit },
      matches,
      count: matches.length,
      classificationStatus: matches.length ? "CANDIDATES" : "NO_CANDIDATE",
      disclaimer: "Search results are HS candidates, not a binding customs classification. HS 6-digit codes can differ across HS revisions; confirm the applicable revision and national tariff line."
    });
  } catch (error) {
    const timedOut = error?.detail?.code === "WITS_TIMEOUT";
    return json({
      error: timedOut ? "HS data source timed out" : "HS lookup failed",
      message: error instanceof Error ? error.message : String(error),
      detail: error?.detail || null,
      retryable: timedOut
    }, timedOut ? 504 : 502, "no-store");
  }
}
