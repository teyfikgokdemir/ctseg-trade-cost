import { TrVatMode, createTrVatLine } from "../../packages/rules/src/tr.js";
import { getCountryRuleProfile, listConfiguredCountryRulePacks } from "../../packages/rules/src/registry.js";

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": status === 200 ? "public, max-age=3600" : "no-store" }
  });
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const action = (url.searchParams.get("action") || "").trim().toLowerCase();
  const country = (url.searchParams.get("country") || "").trim().toUpperCase();
  const mode = (url.searchParams.get("mode") || "").trim().toUpperCase();
  const rateParam = url.searchParams.get("rate");
  const verifiedRate = rateParam === null || rateParam === "" ? null : Number(rateParam);

  if (action === "packs") {
    return json({
      provider: "country-tax-rules",
      sourceType: "RULE_REGISTRY",
      configuredCountries: listConfiguredCountryRulePacks()
    });
  }

  if (!country) {
    return json({
      error: "country is required",
      examples: [
        "/api/tax?country=TR",
        "/api/tax?country=TR&mode=IMPORT_VAT",
        "/api/tax?action=packs"
      ]
    }, 400);
  }

  let profile;
  try {
    profile = getCountryRuleProfile(country);
  } catch (error) {
    return json({
      error: "Invalid country code",
      message: error instanceof Error ? error.message : String(error)
    }, 400);
  }

  if (!mode) {
    return json({
      provider: "country-tax-rules",
      sourceType: "RULE_REGISTRY",
      country,
      profile,
      disclaimer: "A configured rule pack describes calculation structure only. Product-specific rates, exemptions, recoverability and transaction treatment must still be verified before final quoting."
    });
  }

  if (profile.status !== "CONFIGURED") {
    return json({
      error: "Country rule pack is not configured yet",
      country,
      status: profile.status,
      profile,
      availableCountries: listConfiguredCountryRulePacks().map(x => x.country)
    }, 404);
  }

  if (country !== "TR") {
    return json({
      error: "Configured country rule handler is not implemented",
      country,
      status: "HANDLER_NOT_IMPLEMENTED"
    }, 501);
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
      profile,
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
