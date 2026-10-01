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
    error: "D1 calculation operation failed",
    message: error instanceof Error ? error.message : String(error)
  }, 500);
}

export async function onRequestGet({ request, env }) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const workspaceId = normalizeWorkspaceId(url.searchParams.get("workspaceId"));
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 25), 1), 100);

    const result = await db.prepare(`
      SELECT id, input_json, result_json, created_at
      FROM calculations
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(workspaceId, limit).all();

    return json({
      provider: "cloudflare-d1",
      workspaceId,
      calculations: (result.results || []).map(row => ({
        id: row.id,
        input: JSON.parse(row.input_json),
        result: JSON.parse(row.result_json),
        createdAt: row.created_at
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

    if (!body.input || !body.result) {
      return json({ error: "input and result are required" }, 400);
    }

    await ensureTenant(db, workspaceId);

    const inputJson = JSON.stringify(body.input);
    const resultJson = JSON.stringify(body.result);

    const duplicate = await db.prepare(`
      SELECT id, created_at
      FROM calculations
      WHERE tenant_id = ?
        AND input_json = ?
        AND result_json = ?
        AND datetime(created_at) >= datetime('now', '-10 minutes')
      ORDER BY datetime(created_at) DESC
      LIMIT 1
    `).bind(
      workspaceId,
      inputJson,
      resultJson
    ).first();

    if (duplicate?.id) {
      return json({
        status: "DUPLICATE_SKIPPED",
        id: duplicate.id,
        createdAt: duplicate.created_at
      }, 200);
    }

    const id = crypto.randomUUID();
    await db.prepare(
      "INSERT INTO calculations (id, tenant_id, input_json, result_json) VALUES (?, ?, ?, ?)"
    ).bind(
      id,
      workspaceId,
      inputJson,
      resultJson
    ).run();

    return json({ status: "CREATED", id }, 201);
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
    const all = (url.searchParams.get("all") || "").toLowerCase() === "true";

    if (!id && !all) {
      return json({ error: "id or all=true is required" }, 400);
    }

    if (all) {
      const result = await db.prepare(
        "DELETE FROM calculations WHERE tenant_id = ?"
      ).bind(workspaceId).run();

      return json({
        status: "ALL_DELETED",
        changes: result.meta?.changes ?? null
      });
    }

    const result = await db.prepare(
      "DELETE FROM calculations WHERE id = ? AND tenant_id = ?"
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
