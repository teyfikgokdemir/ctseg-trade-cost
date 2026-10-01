const WTO_BASE = "https://api.wto.org/timeseries/v1";

function authHeaders(apiKey) {
  return {
    "Accept": "application/json",
    "Ocp-Apim-Subscription-Key": apiKey
  };
}

function normalizeWtoError(status, body) {
  return {
    provider: "wto-timeseries-v1",
    sourceType: "OFFICIAL",
    status,
    message: typeof body === "string" ? body.slice(0, 500) : body
  };
}

export function parseWtoResponseBody(text, status = 200) {
  const body = String(text || "").trim();

  if (!body) {
    return {
      status: "NO_DATA",
      httpStatus: status,
      data: []
    };
  }

  try {
    return JSON.parse(body);
  } catch {
    return {
      status: "NON_JSON_RESPONSE",
      httpStatus: status,
      raw: body.slice(0, 1000)
    };
  }
}

export async function fetchWtoIndicators(apiKey) {
  if (!apiKey) throw new Error("WTO_API_KEY is not configured");

  const url = new URL(`${WTO_BASE}/indicators`);
  url.searchParams.set("i", "all");
  url.searchParams.set("t", "all");
  url.searchParams.set("pc", "all");
  url.searchParams.set("tp", "all");
  url.searchParams.set("frq", "all");
  url.searchParams.set("lang", "1");

  const response = await fetch(url.toString(), {
    headers: authHeaders(apiKey),
    cf: { cacheTtl: 86400, cacheEverything: true }
  });

  const text = await response.text();
  if (!response.ok) {
    throw Object.assign(new Error("WTO indicators request failed"), {
      detail: normalizeWtoError(response.status, text)
    });
  }

  return parseWtoResponseBody(text, response.status);
}

export async function fetchWtoTimeseries(apiKey, params) {
  if (!apiKey) throw new Error("WTO_API_KEY is not configured");

  const url = new URL(`${WTO_BASE}/data`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: authHeaders(apiKey),
    cf: { cacheTtl: 21600, cacheEverything: true }
  });

  const text = await response.text();
  if (!response.ok) {
    throw Object.assign(new Error("WTO timeseries request failed"), {
      detail: normalizeWtoError(response.status, text)
    });
  }

  return parseWtoResponseBody(text, response.status);
}

export function createWtoTariffProvider(apiKey) {
  return {
    id: "wto-timeseries-v1",
    name: "WTO Timeseries API v1",
    capabilities: ["customs_tariffs", "mfn_tariffs", "preferential_tariffs", "bound_tariffs", "hs"],
    async fetch(request = {}) {
      if (request.kind === "indicators") {
        return fetchWtoIndicators(apiKey);
      }
      return fetchWtoTimeseries(apiKey, request.params || request);
    }
  };
}
