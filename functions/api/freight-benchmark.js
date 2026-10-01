import { buildFreightBenchmark } from "../../packages/core/src/freight.js";

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const result = buildFreightBenchmark(body || {});
    return Response.json({
      provider: "ctseg-freight-benchmark-v1",
      sourceType: "COMPOSITE",
      generatedAt: new Date().toISOString(),
      result
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({
      error: "Freight benchmark calculation failed",
      message: error instanceof Error ? error.message : String(error)
    }, {
      status: 400,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
