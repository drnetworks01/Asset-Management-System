import * as dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');
const SEED_FILE = path.resolve(process.cwd(), 'supabase/seed.sql');

function buildPoolerConnStr(host: string, port: number): string {
  const projectId = process.env.SUPABASE_PROJECT_ID!;
  const password = process.env.SUPABASE_DB_PASSWORD!;
  const enc = encodeURIComponent(password);
  return `postgresql://postgres.${projectId}:${enc}@${host}:${port}/postgres`;
}

async function tryConnect(): Promise<Client> {
  const hosts: Array<[string, number]> = [];
  const regions = [
    'ap-southeast-1',
    'ap-south-1',
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'eu-west-2',
    'eu-central-1',
    'ap-northeast-1',
    'ap-southeast-2',
  ];
  for (const prefix of ['aws-0', 'aws-1']) {
    for (const region of regions) {
      for (const port of [6543, 5432]) {
        hosts.push([`${prefix}-${region}.pooler.supabase.com`, port]);
      }
    }
  }
  for (const [host, port] of hosts) {
    const client = new Client({
      connectionString: buildPoolerConnStr(host, port),
      connectionTimeoutMillis: 4000,
    });
    try {
      await client.connect();
      console.log(`✓ Connected: ${host}:${port}`);
      return client;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${host}:${port}: ${msg.split('\n')[0]}`);
      try { await client.end(); } catch { /* ignore */ }
    }
  }
  throw new Error('Could not connect through any pooler region.');
}

async function runFile(client: Client, filePath: string, label: string) {
  const sql = await fs.readFile(filePath, 'utf8');
  console.log(`\n→ Applying ${label} (${sql.length} bytes)`);
  await client.query(sql);
  console.log(`✓ ${label} applied`);
}

async function main() {
  const args = process.argv.slice(2);
  const includeSeed = args.includes('--seed');

  const client = await tryConnect();

  try {
    const migrationFiles = (await fs.readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      await runFile(client, path.join(MIGRATIONS_DIR, file), `migration ${file}`);
    }

    if (includeSeed) {
      await runFile(client, SEED_FILE, 'seed.sql');
    }

    const result = await client.query(`
      select
        (select count(*) from public.floors) as floors,
        (select count(*) from public.categories) as categories,
        (select count(*) from public.locations) as locations,
        (select count(*) from public.items) as items;
    `);
    console.log('\nDB state:', result.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
