import { TrVatMode, createTrVatLine } from "../../packages/rules/src/tr.js";

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": status === 200 ? "public, max-age=3600" : "no-store" }
  });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const country = (url.searchParams.get("country") || "").trim().toUpperCase();
  const mode = (url.searchParams.get("mode") || "").trim().toUpperCase();
  const rateParam = url.searchParams.get("rate");
  const verifiedRate = rateParam === null || rateParam === "" ? null : Number(rateParam);

  if (!country) {
    return json({
      error: "country is required",
      examples: [
        "/api/tax?country=TR&mode=IMPORT_VAT",
        "/api/tax?country=TR&mode=EXPORT_REGISTERED&rate=10"
      ]
    }, 400);
  }

  if (country !== "TR") {
    return json({
      error: "Country rule pack is not configured yet",
      country,
      availableCountries: ["TR"],
      status: "NOT_CONFIGURED"
    }, 404);
  }

  if (!Object.values(TrVatMode).includes(mode)) {
    return json({
      error: "Unsupported Türkiye VAT mode",
      availableModes: Object.values(TrVatMode)
    }, 400);
  }

  if (rateParam !== null && (!Number.isFinite(verifiedRate) || verifiedRate < 0)) {
    return json({ error: "rate must be a non-negative number" }, 400);
  }

  try {
    const rule = createTrVatLine({ mode, verifiedRate });

    return json({
      provider: "country-tax-rules",
      sourceType: "OFFICIAL",
      country: "TR",
      mode,
      rule,
      disclaimer: "This rule describes the calculation model, not a binding tax determination. Product-specific VAT rate, eligibility, recoverability and filing treatment must be verified for the actual transaction."
    });
  } catch (error) {
    return json({
      error: "Tax rule generation failed",
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}
