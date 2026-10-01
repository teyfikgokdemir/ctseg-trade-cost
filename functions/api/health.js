export async function onRequestGet() {
  return Response.json({
    ok: true,
    service: "ctseg-trade-cost",
    version: "0.2.0",
    time: new Date().toISOString()
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
