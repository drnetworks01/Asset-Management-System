/**
 * Mint a kurikara_session cookie for the admin user and print it.
 * Usage: tsx scripts/mint-session-cookie.ts
 *
 * Used only for end-to-end smoke tests from the command line. Not for prod.
 */
import path from 'node:path';
import { sealData } from 'iron-session';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);

const PASSWORD =
  process.env.SESSION_PASSWORD ??
  'dev-only-do-not-use-in-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function main() {
  const db = new Database(DB_PATH);
  const admin = db
    .prepare("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1")
    .get() as { id: string; email: string; role: string };
  db.close();

  if (!admin) {
    console.error('No admin user found.');
    process.exit(1);
  }

  const sealed = await sealData(
    { userId: admin.id, email: admin.email, role: admin.role },
    { password: PASSWORD, ttl: 0 },
  );

  // Print cookie header value suitable for curl -b
  console.log(`kurikara_session=${sealed}`);
}

main();
