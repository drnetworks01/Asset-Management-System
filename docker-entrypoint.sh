#!/bin/sh
# =====================================================================
# Runs every container start. Idempotent.
#   1. Apply pending Drizzle migrations to the volume's SQLite file.
#   2. Seed inventory ONLY on first boot (when items table is empty).
#   3. Hand off to the Next.js standalone server.
# =====================================================================
set -e

export DATABASE_FILE="${DATABASE_FILE:-/app/data/kurikara.db}"

echo "[entrypoint] DB file: $DATABASE_FILE"

# Apply Drizzle migrations (creates tables if missing, no-op if up-to-date)
# Uses the globally-installed tsx (npm install -g in the Dockerfile) which
# has its own complete node_modules with esbuild + get-tsconfig siblings.
echo "[entrypoint] Running migrations..."
tsx ./scripts/migrate.ts

# First-boot seed: only if items table is empty.
# We use a tiny inline JS to avoid needing extra deps in the runner image.
ITEM_COUNT=$(node -e "
const db = require('./node_modules/better-sqlite3')(process.env.DATABASE_FILE || '/app/data/kurikara.db');
try {
  const row = db.prepare('select count(*) as n from items').get();
  console.log(row.n);
} catch (e) {
  console.log(0);
}
db.close();
")

if [ "$ITEM_COUNT" = "0" ]; then
  echo "[entrypoint] Empty database detected — running first-boot seed..."
  tsx ./scripts/seed-db.ts || echo "[entrypoint] seed failed (continuing)"
else
  echo "[entrypoint] DB has $ITEM_COUNT items — skipping seed."
fi

echo "[entrypoint] Starting Next.js server on port ${PORT:-3010}..."
exec "$@"
