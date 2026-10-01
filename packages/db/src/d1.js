export function requireDb(env) {
  if (!env?.DB) {
    const error = new Error("D1 database binding is not configured");
    error.code = "DB_NOT_CONFIGURED";
    throw error;
  }
  return env.DB;
}

export function normalizeWorkspaceId(value) {
  const id = String(value || "").trim();
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(id)) {
    const error = new Error("workspaceId is required and must be 8-80 safe characters");
    error.code = "INVALID_WORKSPACE_ID";
    throw error;
  }
  return id;
}

export async function ensureTenant(db, workspaceId) {
  await db.prepare(
    "INSERT OR IGNORE INTO tenants (id, name) VALUES (?, ?)"
  ).bind(workspaceId, "Workspace " + workspaceId.slice(0, 8)).run();
}
