/**
 * Adds the two missed room inventories from the second hand-written list:
 *   - Boys Hostal: 7 rooms × per-room items → "Hostal — General"
 *   - Girls Hostal: totals → "Girls Hostal — Common"
 *
 * Re-runnable: skips items that already exist with the same name+location.
 * Logs every insert via the audit table for traceability.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);
const ADMIN_EMAIL = 'admin@kurikaralanka.local';

type Insert = {
  locationSlug: string;
  categoryName: string;
  name: string;
  qty: number;
  notes?: string | null;
};

const BOYS_ROOMS = 7;
const BOYS_PER_ROOM: Array<{ name: string; qty: number; category: string }> = [
  { name: 'Single Bed', qty: 2, category: 'Bed' },
  { name: 'Glass', qty: 1, category: 'Utensil' },
  { name: 'Long Desk', qty: 1, category: 'Furniture' },
  { name: 'Plastic Chair', qty: 2, category: 'Chair' },
];

const GIRLS_TOTAL: Array<{ name: string; qty: number; category: string; notes?: string }> = [
  { name: 'Single Bed', qty: 4, category: 'Bed' },
  { name: 'Glass', qty: 1, category: 'Utensil' },
  { name: 'Dust Bin', qty: 1, category: 'Misc' },
  { name: 'Pan', qty: 1, category: 'Utensil' },
  // Use existing transliteration if present to avoid duplicates; "Kossa (Broom)" is already in DB.
  { name: 'Kossa (Broom)', qty: 1, category: 'Equipment', notes: 'Sinhala: කොස්ස' },
];

function main() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  const lookupLoc = db.prepare('select id from locations where slug = ?');
  const lookupCat = db.prepare('select id from categories where name = ?');
  const insertCat = db.prepare(
    'insert into categories (id, name) values (?, ?) on conflict(name) do nothing',
  );
  const existingItem = db.prepare(
    "select id from items where location_id = ? and lower(name) = lower(?) and deleted_at is null",
  );
  const insertItem = db.prepare(`
    insert into items (id, location_id, category_id, name, qty, condition, notes)
    values (@id, @locationId, @categoryId, @name, @qty, 'good', @notes)
  `);
  const auditInsert = db.prepare(`
    insert into audit_log (id, entity_type, entity_id, action, after, user_email)
    values (?, 'item', ?, 'create', ?, ?)
  `);

  function ensureCategory(name: string): string {
    const existing = lookupCat.get(name) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = randomUUID();
    insertCat.run(id, name);
    return id;
  }

  function applyOne(item: Insert): 'inserted' | 'skipped' {
    const loc = lookupLoc.get(item.locationSlug) as { id: string } | undefined;
    if (!loc) {
      console.warn(`Location not found: ${item.locationSlug}`);
      return 'skipped';
    }
    const existing = existingItem.get(loc.id, item.name);
    if (existing) {
      console.log(`  • Skip (exists): ${item.name} @ ${item.locationSlug}`);
      return 'skipped';
    }
    const catId = ensureCategory(item.categoryName);
    const itemId = randomUUID();
    insertItem.run({
      id: itemId,
      locationId: loc.id,
      categoryId: catId,
      name: item.name,
      qty: item.qty,
      notes: item.notes ?? null,
    });
    auditInsert.run(
      randomUUID(),
      itemId,
      JSON.stringify({
        name: item.name,
        qty: item.qty,
        category: item.categoryName,
        source: 'apply-missed-hostel-items',
      }),
      ADMIN_EMAIL,
    );
    console.log(`  ✓ Inserted: ${item.name} ×${item.qty} @ ${item.locationSlug}`);
    return 'inserted';
  }

  const tx = db.transaction(() => {
    let inserted = 0;
    let skipped = 0;

    console.log('Boys Hostal (× 7 rooms → Hostal-General):');
    for (const i of BOYS_PER_ROOM) {
      const r = applyOne({
        locationSlug: 'hostal-general',
        categoryName: i.category,
        name: i.name,
        qty: i.qty * BOYS_ROOMS,
        notes: `${i.qty} per room × 7 rooms`,
      });
      r === 'inserted' ? inserted++ : skipped++;
    }

    console.log('\nGirls Hostal (totals → girls-hostal-common):');
    for (const i of GIRLS_TOTAL) {
      const r = applyOne({
        locationSlug: 'girls-hostal-common',
        categoryName: i.category,
        name: i.name,
        qty: i.qty,
        notes: i.notes,
      });
      r === 'inserted' ? inserted++ : skipped++;
    }

    return { inserted, skipped };
  });

  const result = tx();
  console.log(`\nDone. ${result.inserted} inserted, ${result.skipped} skipped.`);
  db.close();
}

main();
