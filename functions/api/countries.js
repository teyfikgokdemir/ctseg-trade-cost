const REPORTERS_URL = "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "CTSEG-Trade-Cost/0.7"
      },
      signal: controller.signal,
      cf: { cacheTtl: 604800, cacheEverything: true }
    });

    if (!res.ok) {
      const body = await res.text();
      throw Object.assign(new Error("UN Comtrade country reference request failed"), {
        detail: { status: res.status, body: body.slice(0, 500), url }
      });
    }

    return res.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw Object.assign(new Error("UN Comtrade country reference timed out"), {
        detail: { code: "COUNTRY_REFERENCE_TIMEOUT", timeoutMs }
      });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeCode(value) {
  const s = String(value ?? "").trim();
  if (!/^\d+$/.test(s)) return null;
  return s.padStart(3, "0");
}

export async function onRequestGet() {
  try {
    const reportersJson = await fetchJson(REPORTERS_URL);
    const rows = Array.isArray(reportersJson?.results) ? reportersJson.results : [];

    const countries = rows
      .filter(row => !row?.entryExpiredDate)
      .filter(row => row?.isGroup !== true)
      .map(row => {
        const code = normalizeCode(row.reporterCode ?? row.id);
        if (!code) return null;

        return {
          code,
          name: row.reporterDesc || row.text || code,
          iso2: row.reporterCodeIsoAlpha2 || null,
          iso3: row.reporterCodeIsoAlpha3 || null,
          canReport: true,
          canPartner: true
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, "en"));

    return Response.json({
      provider: "un-comtrade-reference",
      sourceType: "OFFICIAL",
      sourceName: "United Nations Statistics Division / UN Comtrade",
      reference: "Reporters.json",
      retrievedAt: new Date().toISOString(),
      count: countries.length,
      countries
    }, {
      headers: { "Cache-Control": "public, max-age=86400" }
    });
  } catch (error) {
    const timeout = error?.detail?.code === "COUNTRY_REFERENCE_TIMEOUT";
    return Response.json({
      error: timeout ? "Country reference timed out" : "Country reference lookup failed",
      message: error instanceof Error ? error.message : String(error),
      detail: error?.detail || null,
      retryable: timeout
    }, {
      status: timeout ? 504 : 502,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
