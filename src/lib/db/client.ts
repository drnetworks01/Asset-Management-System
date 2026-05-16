import 'server-only';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';

const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_FILE ?? 'data/kurikara.db');

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof drizzle> | undefined;
}

function buildSqlite(): Database.Database {
  ensureDataDir();
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return sqlite;
}

export const sqlite =
  globalThis.__sqlite ??
  (globalThis.__sqlite = buildSqlite());

export const db =
  globalThis.__drizzle ??
  (globalThis.__drizzle = drizzle(sqlite, { schema }));

export { schema };
