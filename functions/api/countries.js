const REPORTERS_URL = "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";
const PARTNERS_URL = "https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json";

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "CTSEG-Trade-Cost/0.7" },
    cf: { cacheTtl: 604800, cacheEverything: true }
  });
  if (!res.ok) {
    const body = await res.text();
    throw Object.assign(new Error("UN Comtrade country reference request failed"), {
      detail: { status: res.status, body: body.slice(0, 500), url }
    });
  }
  return res.json();
}

function normalizeCode(value) {
  const s = String(value ?? "").trim();
  if (!/^\d+$/.test(s)) return null;
  return s.padStart(3, "0");
}

function isCurrentReporter(row) {
  return !row?.entryExpiredDate;
}

export async function onRequestGet() {
  try {
    const [reportersJson, partnersJson] = await Promise.all([
      fetchJson(REPORTERS_URL),
      fetchJson(PARTNERS_URL)
    ]);

    const reporters = Array.isArray(reportersJson?.results) ? reportersJson.results : [];
    const partners = Array.isArray(partnersJson?.results) ? partnersJson.results : [];
    const byCode = new Map();

    for (const row of reporters) {
      if (!isCurrentReporter(row)) continue;
      const code = normalizeCode(row.reporterCode ?? row.id);
      if (!code) continue;
      byCode.set(code, {
        code,
        name: row.reporterDesc || row.text || code,
        iso2: row.reporterCodeIsoAlpha2 || null,
        iso3: row.reporterCodeIsoAlpha3 || null,
        canReport: true,
        canPartner: false
      });
    }

    for (const row of partners) {
      const code = normalizeCode(row.partnerCode ?? row.id);
      if (!code || code === "000") continue;
      const current = byCode.get(code) || {
        code,
        name: row.partnerDesc || row.text || code,
        iso2: row.partnerCodeIsoAlpha2 || row.iso2 || null,
        iso3: row.partnerCodeIsoAlpha3 || row.iso3 || null,
        canReport: false,
        canPartner: true
      };
      current.canPartner = true;
      if (!current.name || current.name === code) current.name = row.partnerDesc || row.text || code;
      byCode.set(code, current);
    }

    const countries = [...byCode.values()]
      .filter(x => x.canPartner || x.canReport)
      .sort((a, b) => a.name.localeCompare(b.name, "en"));

    return Response.json({
      provider: "un-comtrade-reference",
      sourceType: "OFFICIAL",
      sourceName: "United Nations Statistics Division / UN Comtrade",
      retrievedAt: new Date().toISOString(),
      countries
    }, {
      headers: { "Cache-Control": "public, max-age=86400" }
    });
  } catch (error) {
    return Response.json({
      error: "Country reference lookup failed",
      message: error instanceof Error ? error.message : String(error),
      detail: error?.detail || null
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
