import fs from 'node:fs/promises';
import path from 'node:path';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');
const SEED_FILE = path.resolve(process.cwd(), 'supabase/seed.sql');
const OUT = path.resolve(process.cwd(), 'supabase/_apply-everything.sql');

async function main() {
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
  const parts: string[] = [
    '-- =====================================================',
    '-- KURIKARA-ASSETS — Combined apply script',
    '-- Paste into Supabase Dashboard → SQL Editor → Run',
    '-- =====================================================',
    '',
  ];

  for (const file of files) {
    const content = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    parts.push(`-- ----- ${file} -----`);
    parts.push(content.trim());
    parts.push('');
  }

  const seed = await fs.readFile(SEED_FILE, 'utf8');
  parts.push('-- ----- seed.sql (174 items) -----');
  parts.push(seed.trim());
  parts.push('');

  await fs.writeFile(OUT, parts.join('\n'), 'utf8');
  const stat = await fs.stat(OUT);
  console.log(`✓ Wrote ${OUT} (${stat.size} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
