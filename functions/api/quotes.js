import { ensureTenant, normalizeWorkspaceId, requireDb } from "../../packages/db/src/d1.js";

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function dbError(error) {
  if (error?.code === "DB_NOT_CONFIGURED") {
    return json({ error: "D1 is not configured", code: error.code }, 503);
  }
  if (error?.code === "INVALID_WORKSPACE_ID") {
    return json({ error: error.message, code: error.code }, 400);
  }
  return json({
    error: "D1 quote operation failed",
    message: error instanceof Error ? error.message : String(error)
  }, 500);
}

export async function onRequestGet({ request, env }) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const workspaceId = normalizeWorkspaceId(url.searchParams.get("workspaceId"));
    const origin = (url.searchParams.get("origin") || "").trim();
    const destination = (url.searchParams.get("destination") || "").trim();
    const equipment = (url.searchParams.get("equipment") || "").trim();
    const now = new Date().toISOString().slice(0, 10);

    let sql = `
      SELECT id, tenant_id, origin_country, origin_city, destination_country,
             destination_city, transport_mode, equipment, commodity, amount,
             currency, source_type, source_name, quoted_at, valid_until,
             actual_paid, metadata_json, created_at
      FROM market_quotes
      WHERE tenant_id = ?
        AND (valid_until IS NULL OR valid_until >= ?)
    `;
    const binds = [workspaceId, now];

    if (origin) {
      sql += " AND lower(origin_city) = lower(?)";
      binds.push(origin);
    }
    if (destination) {
      sql += " AND lower(destination_city) = lower(?)";
      binds.push(destination);
    }
    if (equipment) {
      sql += " AND equipment = ?";
      binds.push(equipment);
    }

    sql += " ORDER BY quoted_at DESC LIMIT 100";

    const result = await db.prepare(sql).bind(...binds).all();

    return json({
      provider: "cloudflare-d1",
      sourceType: "PERSISTED",
      workspaceId,
      count: result.results?.length || 0,
      quotes: (result.results || []).map(row => ({
        id: row.id,
        provider: row.source_name || "",
        rate: Number(row.amount),
        date: row.quoted_at,
        validUntil: row.valid_until,
        origin: row.origin_city,
        destination: row.destination_city,
        containerType: row.equipment,
        currency: row.currency,
        sourceType: row.source_type,
        originCountry: row.origin_country,
        destinationCountry: row.destination_country,
        metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null
      }))
    });
  } catch (error) {
    return dbError(error);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await request.json();
    const workspaceId = normalizeWorkspaceId(body.workspaceId);
    const amount = Number(body.rate ?? body.amount);

    if (!body.origin || !body.destination || !body.equipment || !Number.isFinite(amount) || amount <= 0) {
      return json({
        error: "origin, destination, equipment and positive rate are required"
      }, 400);
    }

    await ensureTenant(db, workspaceId);

    const id = crypto.randomUUID();
    const quotedAt = body.date || new Date().toISOString().slice(0, 10);

    await db.prepare(`
      INSERT INTO market_quotes (
        id, tenant_id, origin_country, origin_city, destination_country,
        destination_city, transport_mode, equipment, commodity, amount,
        currency, source_type, source_name, quoted_at, valid_until, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      workspaceId,
      body.originCountry || null,
      String(body.origin).trim(),
      body.destinationCountry || null,
      String(body.destination).trim(),
      body.transportMode || "ROAD",
      String(body.equipment).trim(),
      body.commodity || null,
      amount,
      body.currency || "USD",
      body.sourceType || "QUOTE",
      body.provider || null,
      quotedAt,
      body.validUntil || null,
      JSON.stringify({
        ...(body.metadata || {}),
        countryOfOrigin: body.countryOfOrigin || null,
        exportCountry: body.exportCountry || body.originCountry || null,
        transitCountries: Array.isArray(body.transitCountries) ? body.transitCountries : []
      })
    ).run();

    return json({
      status: "CREATED",
      quote: {
        id,
        provider: body.provider || "",
        rate: amount,
        date: quotedAt,
        validUntil: body.validUntil || null,
        origin: String(body.origin).trim(),
        destination: String(body.destination).trim(),
        containerType: String(body.equipment).trim(),
        currency: body.currency || "USD",
        originCountry: body.originCountry || null,
        destinationCountry: body.destinationCountry || null,
        metadata: {
          ...(body.metadata || {}),
          countryOfOrigin: body.countryOfOrigin || null,
          exportCountry: body.exportCountry || body.originCountry || null,
          transitCountries: Array.isArray(body.transitCountries) ? body.transitCountries : []
        }
      }
    }, 201);
  } catch (error) {
    return dbError(error);
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const workspaceId = normalizeWorkspaceId(url.searchParams.get("workspaceId"));
    const id = (url.searchParams.get("id") || "").trim();

    if (!id) return json({ error: "id is required" }, 400);

    const result = await db.prepare(
      "DELETE FROM market_quotes WHERE id = ? AND tenant_id = ?"
    ).bind(id, workspaceId).run();

    return json({
      status: "DELETED",
      id,
      changes: result.meta?.changes ?? null
    });
  } catch (error) {
    return dbError(error);
  }
}
