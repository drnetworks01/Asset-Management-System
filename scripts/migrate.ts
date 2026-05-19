import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import fs from 'node:fs';

// Honor the same DATABASE_FILE env var the runtime uses (see src/lib/db/client.ts).
// This is critical on Fly.io where the volume mounts to a non-default path.
const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir();
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite);

console.log(`Migrating ${DB_PATH}`);
migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
console.log('✓ Migrations applied');
sqlite.close();
