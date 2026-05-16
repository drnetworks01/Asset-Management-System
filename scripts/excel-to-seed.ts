import fs from 'node:fs/promises';
import path from 'node:path';
import { parseExcel } from '../src/lib/excel/parser';
import { normalizeAll } from '../src/lib/excel/normalizer';

const EXCEL_PATH = path.resolve(process.cwd(), 'tests/fixtures/Office_Assets_v2.xlsx');
const OUT_PATH = path.resolve(process.cwd(), 'supabase/seed.sql');

function sqlEscape(s: string | null): string {
  if (s === null) return 'null';
  return `'${s.replace(/'/g, "''")}'`;
}

async function main() {
  console.log(`Parsing: ${EXCEL_PATH}`);
  const { rows, sheetsProcessed } = await parseExcel(EXCEL_PATH);
  console.log(`Sheets: ${sheetsProcessed.join(', ')}`);
  console.log(`Raw rows: ${rows.length}`);

  const normalized = normalizeAll(rows);
  console.log(`Normalized rows: ${normalized.length}`);

  const uniqueCategories = [
    ...new Set(normalized.map((r) => r.categoryName).filter((c): c is string => !!c)),
  ].sort();
  const uniqueLocations = [
    ...new Map(normalized.map((r) => [r.locationSlug, r.locationName])).entries(),
  ].sort();

  console.log(`Unique categories: ${uniqueCategories.length}`);
  console.log(`Unique locations: ${uniqueLocations.length}`);

  const sqlParts: string[] = [
    '-- Auto-generated from Office_Assets_v2.xlsx',
    `-- Generated at ${new Date().toISOString()}`,
    '',
    'begin;',
    '',
    '-- Categories',
  ];

  for (const cat of uniqueCategories) {
    sqlParts.push(
      `insert into public.categories (name) values (${sqlEscape(cat)}) on conflict (name) do nothing;`,
    );
  }

  sqlParts.push('', '-- Locations (default rectangular layout)');

  const COLS = 4;
  const W = 200;
  const H = 150;
  const GAP = 40;

  uniqueLocations.forEach(([slug, name], i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = 40 + col * (W + GAP);
    const y = 40 + row * (H + GAP);
    const shapeData = JSON.stringify({ x, y, width: W, height: H, rotation: 0 });
    sqlParts.push(
      `insert into public.locations (floor_id, name, slug, shape, shape_data, display_order)`,
      `  select id, ${sqlEscape(name)}, ${sqlEscape(slug)}, 'rect', '${shapeData}'::jsonb, ${i}`,
      `  from public.floors where level = 1`,
      `  on conflict (slug) do nothing;`,
    );
  });

  sqlParts.push('', '-- Items');

  for (const r of normalized) {
    const noteVal = r.notes === null ? 'null' : sqlEscape(r.notes);
    const catSubquery = r.categoryName
      ? `(select id from public.categories where name = ${sqlEscape(r.categoryName)})`
      : 'null';
    sqlParts.push(
      `insert into public.items (location_id, category_id, name, qty, condition, notes)`,
      `  select l.id, ${catSubquery}, ${sqlEscape(r.itemName)}, ${r.qty}, '${r.condition}', ${noteVal}`,
      `  from public.locations l where l.slug = ${sqlEscape(r.locationSlug)};`,
    );
  }

  sqlParts.push('', 'commit;', '');

  const sql = sqlParts.join('\n');
  await fs.writeFile(OUT_PATH, sql, 'utf8');
  console.log(`✓ Wrote ${OUT_PATH} (${sql.length} bytes, ${normalized.length} items)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
