# Cloudflare D1 setup

The application is D1-ready but deliberately does not contain a fake database id.

## Create the database

```bash
npx wrangler d1 create ctseg-trade-cost-db
```

Copy the returned `database_id` into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "ctseg-trade-cost-db",
    "database_id": "<REAL_DATABASE_ID>",
    "migrations_dir": "migrations"
  }
]
```

## Apply migrations

```bash
npx wrangler d1 migrations apply ctseg-trade-cost-db --remote
```

## Runtime behavior

- When the `DB` binding is available, quotes and calculation snapshots persist in D1.
- Until D1 is configured, the UI continues using localStorage.
- The API returns `503 DB_NOT_CONFIGURED` instead of pretending persistence succeeded.
- Each browser gets an anonymous workspace id. Authentication/organization ownership will replace this temporary workspace mechanism in a later productization phase.

## Persistence APIs

- `GET /api/quotes?workspaceId=...`
- `POST /api/quotes`
- `DELETE /api/quotes?workspaceId=...&id=...`
- `GET /api/calculations?workspaceId=...`
- `POST /api/calculations`
