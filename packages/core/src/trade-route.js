function normalizeIso2(value, field, { required = true } = {}) {
  const code = String(value || "").trim().toUpperCase();
  if (!code && !required) return null;
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new Error(`${field} must be an ISO 3166-1 alpha-2 code`);
  }
  return code;
}

export const TransportMode = Object.freeze({
  SEA: "SEA",
  ROAD: "ROAD",
  RAIL: "RAIL",
  AIR: "AIR",
  MULTIMODAL: "MULTIMODAL"
});

export function normalizeTradeChain({
  countryOfOrigin,
  exportCountry,
  importCountry,
  transitCountries = [],
  transportMode = TransportMode.SEA,
  departurePoint = null,
  destinationPoint = null
} = {}) {
  const origin = normalizeIso2(countryOfOrigin, "countryOfOrigin");
  const exporter = normalizeIso2(exportCountry, "exportCountry");
  const importer = normalizeIso2(importCountry, "importCountry");

  if (!Object.values(TransportMode).includes(transportMode)) {
    throw new Error("Unsupported transportMode");
  }

  const transit = [...new Set((Array.isArray(transitCountries) ? transitCountries : [])
    .map((code, index) => normalizeIso2(code, `transitCountries[${index}]`)))];

  return {
    scope: "GLOBAL",
    countryOfOrigin: origin,
    exportCountry: exporter,
    transitCountries: transit,
    importCountry: importer,
    transportMode,
    departurePoint: departurePoint ? String(departurePoint).trim() : null,
    destinationPoint: destinationPoint ? String(destinationPoint).trim() : null
  };
}

export function tariffRouteFromTradeChain(chain) {
  const route = normalizeTradeChain(chain);
  return {
    partnerCountry: route.countryOfOrigin,
    reporterCountry: route.importCountry
  };
}

export function freightRouteFromTradeChain(chain) {
  const route = normalizeTradeChain(chain);
  return {
    originCountry: route.exportCountry,
    destinationCountry: route.importCountry,
    transitCountries: route.transitCountries,
    transportMode: route.transportMode,
    departurePoint: route.departurePoint,
    destinationPoint: route.destinationPoint
  };
}
