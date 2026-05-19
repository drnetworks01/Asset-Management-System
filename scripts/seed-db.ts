import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { parseExcel } from '../src/lib/excel/parser';
import { normalizeAll } from '../src/lib/excel/normalizer';
import * as schema from '../src/lib/db/schema';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);
const EXCEL_PATH = path.resolve(process.cwd(), 'tests/fixtures/Office_Assets_v2.xlsx');

// In production we REFUSE to fall back to admin1234 — operators must set
// real credentials. In dev/CI the well-known defaults are fine.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in production. ' +
        'Set them via `flyctl secrets set` before running db:seed.',
    );
  }
  if (
    process.env.SEED_ADMIN_PASSWORD === 'admin1234' ||
    process.env.SEED_ADMIN_PASSWORD.length < 10
  ) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be at least 10 chars and not the well-known default.',
    );
  }
}
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@kurikaralanka.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';

async function main() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });

  // 1. Admin user
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, ADMIN_EMAIL),
  });
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.insert(schema.users)
      .values({ email: ADMIN_EMAIL, passwordHash: hash, role: 'admin' })
      .run();
    console.log(`✓ Admin created: ${ADMIN_EMAIL}  (password: ${ADMIN_PASSWORD})`);
  } else {
    console.log(`• Admin already exists: ${ADMIN_EMAIL}`);
  }

  // 2. Floors
  for (const level of [1, 2, 3]) {
    const existing = await db.query.floors.findFirst({
      where: eq(schema.floors.level, level),
    });
    if (!existing) {
      db.insert(schema.floors).values({ level, name: `Floor ${level}` }).run();
    }
  }
  const floor1 = await db.query.floors.findFirst({
    where: eq(schema.floors.level, 1),
  });
  if (!floor1) throw new Error('Floor 1 missing');
  console.log('✓ Floors ready');

  // 3. Parse Excel
  const { rows: rawRows } = await parseExcel(EXCEL_PATH);
  const normalized = normalizeAll(rawRows);
  console.log(`Parsed ${normalized.length} items from Excel`);

  // 4. Categories
  const uniqueCats = [
    ...new Set(normalized.map((r) => r.categoryName).filter((c): c is string => !!c)),
  ].sort();
  const insertCat = db
    .insert(schema.categories)
    .values({ name: '__placeholder__' })
    .onConflictDoNothing()
    .prepare();
  for (const name of uniqueCats) {
    db.insert(schema.categories).values({ name }).onConflictDoNothing().run();
  }
  // silence unused
  void insertCat;
  console.log(`✓ ${uniqueCats.length} categories ready`);

  const allCats = await db.query.categories.findMany();
  const catBySlug = new Map(allCats.map((c) => [c.name, c.id]));

  // 5. Locations
  const uniqueLocs = [
    ...new Map(normalized.map((r) => [r.locationSlug, r.locationName])).entries(),
  ].sort();

  const COLS = 4;
  const W = 200;
  const H = 150;
  const GAP = 40;

  uniqueLocs.forEach(([slug, name], i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = 40 + col * (W + GAP);
    const y = 40 + row * (H + GAP);
    db.insert(schema.locations)
      .values({
        floorId: floor1.id,
        name,
        slug,
        shape: 'rect',
        shapeData: { x, y, width: W, height: H, rotation: 0 },
        displayOrder: i,
      })
      .onConflictDoNothing()
      .run();
  });
  console.log(`✓ ${uniqueLocs.length} locations placed on Floor 1`);

  const allLocs = await db.query.locations.findMany();
  const locBySlug = new Map(allLocs.map((l) => [l.slug, l.id]));

  // 6. Items — wipe first to be idempotent
  db.delete(schema.items).run();
  const insertedItems: typeof schema.items.$inferInsert[] = normalized
    .map((r) => {
      const locationId = locBySlug.get(r.locationSlug);
      if (!locationId) return null;
      return {
        locationId,
        categoryId: r.categoryName ? catBySlug.get(r.categoryName) ?? null : null,
        name: r.itemName,
        qty: r.qty,
        condition: r.condition,
        notes: r.notes,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  // Batch insert
  const batchSize = 100;
  for (let i = 0; i < insertedItems.length; i += batchSize) {
    db.insert(schema.items).values(insertedItems.slice(i, i + batchSize)).run();
  }
  console.log(`✓ ${insertedItems.length} items inserted`);

  // 7. Summary
  const counts = sqlite
    .prepare(
      `select
        (select count(*) from floors) as floors,
        (select count(*) from categories) as categories,
        (select count(*) from locations) as locations,
        (select count(*) from items) as items,
        (select count(*) from users) as users`,
    )
    .get();
  console.log('\nDB summary:', counts);

  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
