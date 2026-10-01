import { getHs2022ByCode, searchHs2022 } from "../../packages/providers/src/un-hs2022.js";
import { fetchWitsProductByCode } from "../../packages/providers/src/wits.js";

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
  const verify = (url.searchParams.get("verify") || "").toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 10), 1), 25);

  if (!code && !q) {
    return json({
      error: "Provide ?code=XXXXXX or ?q=search text",
      examples: [
        "/api/hs?code=292250",
        "/api/hs?q=threonine",
        "/api/hs?code=292250&verify=wits"
      ]
    }, 400, "no-store");
  }

  try {
    if (code) {
      if (!HS6.test(code)) {
        return json({ error: "HS code must be exactly 6 digits" }, 400, "no-store");
      }

      const match = await getHs2022ByCode(code);
      let secondaryVerification = null;

      if (verify === "wits") {
        try {
          secondaryVerification = await fetchWitsProductByCode(code);
        } catch (error) {
          secondaryVerification = {
            status: "UNAVAILABLE",
            message: error instanceof Error ? error.message : String(error)
          };
        }
      }

      return json({
        provider: "un-comtrade-hs2022",
        sourceType: "OFFICIAL",
        sourceName: "United Nations Statistics Division / UN Comtrade",
        hsRevision: "HS2022",
        retrievedAt: new Date().toISOString(),
        query: { code },
        match,
        secondaryVerification,
        classificationStatus: match ? "CANDIDATE_FOUND" : "NOT_FOUND",
        disclaimer: "HS 2022 metadata supports classification. Final import/export classification must be confirmed against the importing country's current national tariff schedule."
      });
    }

    if (q.length < 2) {
      return json({ error: "Search text must be at least 2 characters" }, 400, "no-store");
    }

    const matches = await searchHs2022(q, limit);

    return json({
      provider: "un-comtrade-hs2022",
      sourceType: "OFFICIAL",
      sourceName: "United Nations Statistics Division / UN Comtrade",
      hsRevision: "HS2022",
      retrievedAt: new Date().toISOString(),
      query: { q, limit },
      matches,
      count: matches.length,
      classificationStatus: matches.length ? "CANDIDATES" : "NO_CANDIDATE",
      disclaimer: "Search results are HS classification candidates. Curated aliases are support hints, not binding customs rulings. Confirm the importing country's current national tariff line before declaration."
    });
  } catch (error) {
    const timedOut = error?.detail?.code === "UN_HS_TIMEOUT";
    return json({
      error: timedOut ? "HS 2022 catalog timed out" : "HS lookup failed",
      message: error instanceof Error ? error.message : String(error),
      detail: error?.detail || null,
      retryable: timedOut
    }, timedOut ? 504 : 502, "no-store");
  }
}
