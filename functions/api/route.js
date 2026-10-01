async function geocode(query, apiKey) {
  const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const item = data.items?.[0];
  if (!item?.position) throw new Error(`Location not found: ${query}`);
  return {
    title: item.title || query,
    lat: item.position.lat,
    lng: item.position.lng
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

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const originText = url.searchParams.get("origin");
  const destinationText = url.searchParams.get("destination");

  if (!originText || !destinationText) {
    return Response.json({ error: "origin and destination are required" }, { status: 400 });
  }

  if (!env.HERE_API_KEY) {
    return Response.json({
      status: "NOT_CONFIGURED",
      provider: "HERE Routing API v8",
      message: "HERE_API_KEY is not configured."
    }, { status: 503 });
  }

  try {
    const [origin, destination] = await Promise.all([
      geocode(originText, env.HERE_API_KEY),
      geocode(destinationText, env.HERE_API_KEY)
    ]);

    const routeUrl = new URL("https://router.hereapi.com/v8/routes");
    routeUrl.searchParams.set("transportMode", "truck");
    routeUrl.searchParams.set("origin", `${origin.lat},${origin.lng}`);
    routeUrl.searchParams.set("destination", `${destination.lat},${destination.lng}`);
    routeUrl.searchParams.set("routingMode", "fast");
    routeUrl.searchParams.set("return", "summary,tolls");
    routeUrl.searchParams.set("vehicle[grossWeight]", url.searchParams.get("grossWeightKg") || "40000");
    routeUrl.searchParams.set("vehicle[weightPerAxle]", url.searchParams.get("weightPerAxleKg") || "10000");
    routeUrl.searchParams.set("vehicle[height]", url.searchParams.get("heightCm") || "400");
    routeUrl.searchParams.set("apiKey", env.HERE_API_KEY);

    const routeRes = await fetch(routeUrl.toString(), {
      cf: { cacheTtl: 21600, cacheEverything: true }
    });

    if (!routeRes.ok) {
      const detail = await routeRes.text();
      return Response.json({
        error: "Routing provider error",
        status: routeRes.status,
        detail: detail.slice(0, 500)
      }, { status: 502 });
    }

    const data = await routeRes.json();
    const route = data.routes?.[0];
    if (!route) return Response.json({ error: "No truck route found" }, { status: 404 });

    const summary = (route.sections || []).reduce((acc, section) => {
      acc.length += section.summary?.length || 0;
      acc.duration += section.summary?.duration || 0;
      acc.baseDuration += section.summary?.baseDuration || 0;
      return acc;
    }, { length: 0, duration: 0, baseDuration: 0 });

    return Response.json({
      provider: "HERE Routing API v8",
      sourceType: "LIVE",
      updatedAt: new Date().toISOString(),
      origin,
      destination,
      distanceKm: summary.length / 1000,
      durationHours: summary.duration / 3600,
      baseDurationHours: summary.baseDuration / 3600,
      tollTotals: collectTolls(route.sections),
      truckProfile: {
        grossWeightKg: Number(url.searchParams.get("grossWeightKg") || 40000),
        weightPerAxleKg: Number(url.searchParams.get("weightPerAxleKg") || 10000),
        heightCm: Number(url.searchParams.get("heightCm") || 400)
      }
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
