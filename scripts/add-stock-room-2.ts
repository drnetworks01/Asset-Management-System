/**
 * One-time migration:
 *   1) Rename existing "Stock Room" → "Stock Room 1"   (slug: stock-room-1)
 *   2) Rename existing "Store Room" → "Stock Room 3"   (slug: stock-room-3)
 *   3) Create new "Stock Room 2"                       (slug: stock-room-2)
 *      + insert the inventory list from the user's photo.
 *
 * Re-runnable: idempotent on renames and inserts (skips duplicates by slug/name).
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DB_PATH = path.resolve(process.cwd(), 'data/kurikara.db');
const ADMIN_EMAIL = 'admin@kurikaralanka.local';

type ItemSpec = {
  name: string;
  qty: number;
  category: string;
  notes?: string;
};

// Parsed from the photo. White plates total = sum of all addends = 136.
// Sinhala-named items are transliterated with the original glyphs in `notes`.
const STOCK_ROOM_2_ITEMS: ItemSpec[] = [
  {
    name: 'White Plate (large)',
    qty: 136,
    category: 'Utensil',
    notes: 'Sum: 12+12+12+6+15+15+12+17+12+6+2+1+6+8 = 136',
  },
  { name: 'Jug', qty: 2, category: 'Utensil', notes: '1+1' },
  {
    name: 'Cup',
    qty: 7,
    category: 'Utensil',
    notes: '4+1+1+1 (middle entry on sheet was crossed out)',
  },
  { name: 'Glass Ice Cup', qty: 7, category: 'Utensil' },
  { name: 'Aluminum Ice Cup', qty: 12, category: 'Utensil' },
  { name: 'Milk Cup', qty: 3, category: 'Utensil', notes: '1+2' },
  { name: 'Sugar Cup', qty: 4, category: 'Utensil', notes: '3+1' },
  {
    name: 'Tea Cup (small)',
    qty: 2,
    category: 'Utensil',
    notes: 'Original handwriting in Sinhala — please verify name',
  },
  {
    name: 'Glass Bowl (Sinhala name)',
    qty: 5,
    category: 'Utensil',
    notes: 'Sinhala label on sheet — please rename if known',
  },
  { name: 'Soup Bowl', qty: 10, category: 'Utensil', notes: '3+7' },
  {
    name: 'Water Container (Sinhala name)',
    qty: 2,
    category: 'Utensil',
    notes: 'Sinhala label on sheet — please rename if known (1+1)',
  },
  { name: 'Aluminium Plate', qty: 13, category: 'Utensil' },
  { name: 'Tissue Plate', qty: 10, category: 'Utensil' },
  { name: 'White Plate (small)', qty: 25, category: 'Utensil' },
  {
    name: '3×3 Tile',
    qty: 164,
    category: 'Fixture',
    notes: '(19×3)+2 + (34×3)+2 + 1 = 164',
  },
  { name: 'Light Holder', qty: 1, category: 'Fixture', notes: 'Qty not specified on sheet; defaulting to 1 — adjust as needed' },
  { name: 'Ceiling Fan', qty: 1, category: 'Appliance' },
];

function main() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  // ----- Step 1: Renames (idempotent) -----
  const rename = (oldSlug: string, newName: string, newSlug: string) => {
    const existing = db
      .prepare('select id, name, slug from locations where slug = ?')
      .get(oldSlug) as { id: string; name: string; slug: string } | undefined;
    if (!existing) {
      console.log(`  • Skip rename (no row): ${oldSlug}`);
      return;
    }
    if (existing.slug === newSlug && existing.name === newName) {
      console.log(`  • Already renamed: ${newName}`);
      return;
    }
    db.prepare('update locations set name = ?, slug = ? where id = ?').run(
      newName,
      newSlug,
      existing.id,
    );
    console.log(`  ✓ Renamed "${existing.name}" → "${newName}"`);
  };

  console.log('Renaming existing stock rooms:');
  rename('stock-room', 'Stock Room 1', 'stock-room-1');
  rename('store-room', 'Stock Room 3', 'stock-room-3');

  // ----- Step 2: Create "Stock Room 2" if missing -----
  const floor1 = db.prepare("select id from floors where level = 1").get() as
    | { id: string }
    | undefined;
  if (!floor1) throw new Error('Floor 1 not found');

  let stockRoom2 = db
    .prepare('select id from locations where slug = ?')
    .get('stock-room-2') as { id: string } | undefined;

  if (!stockRoom2) {
    const newId = randomUUID();
    // Place between the big Stock Room 1 (1140,380) and Stock Room 3 (1140,800)
    db.prepare(
      `insert into locations
         (id, floor_id, name, slug, shape, shape_data, color, display_order)
       values
         (?, ?, 'Stock Room 2', 'stock-room-2', 'rect', ?, '#0F766E', 5)`,
    ).run(
      newId,
      floor1.id,
      JSON.stringify({
        x: 1140,
        y: 660,
        width: 240,
        height: 120,
        rotation: 0,
      }),
    );
    stockRoom2 = { id: newId };
    console.log(`  ✓ Created location "Stock Room 2" (id=${newId})`);
  } else {
    console.log('  • "Stock Room 2" already exists — keeping it');
  }

  // ----- Step 3: Resolve / create categories -----
  const ensureCategory = (name: string): string => {
    const existing = db
      .prepare('select id from categories where name = ?')
      .get(name) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = randomUUID();
    db.prepare('insert into categories (id, name) values (?, ?)').run(id, name);
    return id;
  };

  // ----- Step 4: Insert items (skip duplicates by name within this room) -----
  let inserted = 0;
  let skipped = 0;

  const auditInsert = db.prepare(`
    insert into audit_log (id, entity_type, entity_id, action, after, user_email)
    values (?, 'item', ?, 'create', ?, ?)
  `);

  const tx = db.transaction(() => {
    console.log(`\nInserting ${STOCK_ROOM_2_ITEMS.length} items into Stock Room 2:`);
    for (const spec of STOCK_ROOM_2_ITEMS) {
      const existing = db
        .prepare(
          "select id from items where location_id = ? and lower(name) = lower(?) and deleted_at is null",
        )
        .get(stockRoom2!.id, spec.name);
      if (existing) {
        console.log(`  • Skip (exists): ${spec.name}`);
        skipped++;
        continue;
      }
      const catId = ensureCategory(spec.category);
      const itemId = randomUUID();
      db.prepare(
        `insert into items (id, location_id, category_id, name, qty, condition, notes)
         values (?, ?, ?, ?, ?, 'good', ?)`,
      ).run(itemId, stockRoom2!.id, catId, spec.name, spec.qty, spec.notes ?? null);
      auditInsert.run(
        randomUUID(),
        itemId,
        JSON.stringify({
          name: spec.name,
          qty: spec.qty,
          category: spec.category,
          source: 'add-stock-room-2',
        }),
        ADMIN_EMAIL,
      );
      console.log(`  ✓ ${spec.name.padEnd(35)} × ${spec.qty}`);
      inserted++;
    }
  });
  tx();

  // ----- Step 5: Summary -----
  const summary = db
    .prepare(
      `select l.name, l.slug, l.qr_code,
              count(i.id) as kinds,
              coalesce(sum(i.qty), 0) as total
       from locations l
       left join items i on i.location_id = l.id and i.deleted_at is null
       where l.slug like 'stock-room%'
       group by l.id
       order by l.slug`,
    )
    .all();

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}\n`);
  console.log('Stock rooms now in DB:');
  console.table(summary);

  db.close();
}

main();
