const ALLOWED = /^[A-Z]{3}$/;

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const base = (url.searchParams.get("base") || "USD").toUpperCase();
  const quote = (url.searchParams.get("quote") || "USD").toUpperCase();

  if (!ALLOWED.test(base) || !ALLOWED.test(quote)) {
    return Response.json({ error: "Invalid currency code" }, { status: 400 });
  }

  if (base === quote) {
    return Response.json({
      base,
      quote,
      rate: 1,
      sourceType: "LIVE",
      sourceName: "Identity rate",
      updatedAt: new Date().toISOString(),
      provider: "internal"
    }, { headers: { "Cache-Control": "public, max-age=3600" } });
  }

  const endpoint = `https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}`;

  try {
    const upstream = await fetch(endpoint, {
      headers: { "Accept": "application/json" },
      cf: { cacheTtl: 3600, cacheEverything: true }
    });

    if (!upstream.ok) {
      const body = await upstream.text();
      return Response.json({
        error: "FX provider error",
        status: upstream.status,
        detail: body.slice(0, 300)
      }, { status: 502 });
    }

    const data = await upstream.json();
    return Response.json({
      base: data.base || base,
      quote: data.quote || quote,
      rate: data.rate,
      date: data.date || null,
      sourceType: "LIVE",
      sourceName: "Frankfurter blended reference rates",
      updatedAt: data.date ? `${data.date}T16:00:00Z` : new Date().toISOString(),
      provider: "frankfurter-v2",
      disclaimer: "Reference/mid-market rate; not an executable bank or FX desk quote."
    }, {
      headers: { "Cache-Control": "public, max-age=3600" }
    });
  } catch (error) {
    return Response.json({
      error: "FX fetch failed",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 502 });
  }
}
