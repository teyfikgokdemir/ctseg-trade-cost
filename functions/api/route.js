const APP_ID = "CTSEG-Trade-Cost/0.5";
const APP_URL = "https://ctseg-trade-cost.pages.dev/";

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

async function geocodeHere(query, apiKey) {
  const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);
  const res = await fetch(url.toString(), { cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!res.ok) throw new Error("HERE geocoding failed");
  const data = await res.json();
  const item = data.items?.[0];
  if (!item?.position) throw new Error(`Location not found: ${query}`);
  return { title: item.title || query, lat: item.position.lat, lng: item.position.lng };
}

async function geocodeOsm(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": `${APP_ID} (${APP_URL})`,
      "Referer": APP_URL,
      "Accept-Language": "tr,en;q=0.8"
    },
    cf: { cacheTtl: 604800, cacheEverything: true }
  });
  if (!res.ok) throw new Error("OSM geocoding failed");
  const data = await res.json();
  const item = data?.[0];
  if (!item) throw new Error(`Location not found: ${query}`);
  return {
    title: item.display_name || query,
    lat: Number(item.lat),
    lng: Number(item.lon)
  };
}

function collectTolls(sections) {
  const totals = {};
  for (const section of sections || []) {
    for (const toll of section.tolls || []) {
      for (const fare of toll.fares || []) {
        const price = fare.price;
        if (!price || !Number.isFinite(price.value)) continue;
        const currency = price.currency || "UNKNOWN";
        totals[currency] = (totals[currency] || 0) + price.value;
      }
    }
  }
  return totals;
}

async function hereRoute(origin, destination, url, apiKey) {
  const routeUrl = new URL("https://router.hereapi.com/v8/routes");
  routeUrl.searchParams.set("transportMode", "truck");
  routeUrl.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  routeUrl.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  routeUrl.searchParams.set("routingMode", "fast");
  routeUrl.searchParams.set("return", "summary,tolls");
  routeUrl.searchParams.set("vehicle[grossWeight]", url.searchParams.get("grossWeightKg") || "40000");
  routeUrl.searchParams.set("vehicle[weightPerAxle]", url.searchParams.get("weightPerAxleKg") || "10000");
  routeUrl.searchParams.set("vehicle[height]", url.searchParams.get("heightCm") || "400");
  routeUrl.searchParams.set("apiKey", apiKey);

  const routeRes = await fetch(routeUrl.toString(), { cf: { cacheTtl: 21600, cacheEverything: true } });
  if (!routeRes.ok) throw new Error("HERE routing failed");
  const data = await routeRes.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No truck route found");

  const summary = (route.sections || []).reduce((acc, section) => {
    acc.length += section.summary?.length || 0;
    acc.duration += section.summary?.duration || 0;
    return acc;
  }, { length: 0, duration: 0 });

  return {
    provider: "HERE Routing API v8",
    sourceType: "LIVE",
    routeMode: "TRUCK",
    truckProfileApplied: true,
    tollDataAvailable: true,
    distanceKm: summary.length / 1000,
    durationHours: summary.duration / 3600,
    tollTotals: collectTolls(route.sections)
  };
}

async function freeRoute(origin, destination) {
  const routeUrl = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
  );
  routeUrl.searchParams.set("overview", "false");
  routeUrl.searchParams.set("steps", "false");
  routeUrl.searchParams.set("alternatives", "false");

  const routeRes = await fetch(routeUrl.toString(), {
    headers: { "User-Agent": `${APP_ID} (${APP_URL})` },
    cf: { cacheTtl: 21600, cacheEverything: true }
  });
  if (!routeRes.ok) throw new Error("OSRM routing failed");
  const data = await routeRes.json();
  const r = data.routes?.[0];
  if (!r) throw new Error("No road route found");

  return {
    provider: "OpenStreetMap + OSRM public routing",
    sourceType: "ESTIMATE",
    routeMode: "ROAD_ESTIMATE",
    truckProfileApplied: false,
    tollDataAvailable: false,
    distanceKm: r.distance / 1000,
    durationHours: r.duration / 3600,
    tollTotals: {}
  };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const originText = url.searchParams.get("origin");
  const destinationText = url.searchParams.get("destination");
  if (!originText || !destinationText) {
    return Response.json({ error: "origin and destination are required" }, { status: 400 });
  }

  try {
    let origin, destination, route;

    if (env.HERE_API_KEY) {
      [origin, destination] = await Promise.all([
        geocodeHere(originText, env.HERE_API_KEY),
        geocodeHere(destinationText, env.HERE_API_KEY)
      ]);
      route = await hereRoute(origin, destination, url, env.HERE_API_KEY);
    } else {
      origin = await geocodeOsm(originText);
      await sleep(1100);
      destination = await geocodeOsm(destinationText);
      route = await freeRoute(origin, destination);
    }

    return Response.json({
      ...route,
      updatedAt: new Date().toISOString(),
      origin,
      destination,
      truckProfile: {
        grossWeightKg: Number(url.searchParams.get("grossWeightKg") || 40000),
        weightPerAxleKg: Number(url.searchParams.get("weightPerAxleKg") || 10000),
        heightCm: Number(url.searchParams.get("heightCm") || 400)
      },
      disclaimer: route.truckProfileApplied
        ? "Truck-aware routing provider result."
        : "Free road-route estimate. Truck restrictions and toll prices are not applied; do not use as a verified carrier quote."
    }, {
      headers: { "Cache-Control": "public, max-age=21600" }
    });
  } catch (error) {
    return Response.json({
      error: "Route calculation failed",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 502 });
  }
}
