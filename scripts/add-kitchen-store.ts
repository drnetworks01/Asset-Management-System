/**
 * One-time migration: add the "Kitchen store" location (Floor 1) and its
 * inventory, parsed from the handwritten list.
 *
 * Re-runnable / idempotent:
 *   - location skipped if slug 'kitchen-store' already exists
 *   - items skipped by (location_id, lower(name)) match
 *
 * Run:  tsx scripts/add-kitchen-store.ts
 *       (honors DATABASE_FILE env, so works locally and on Fly via ssh)
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);
const ADMIN_EMAIL = 'admin@kurikaralanka.local';

type ItemSpec = {
  name: string;
  qty: number;
  category: string;
  notes?: string;
};

// Parsed from the handwritten "Kitchen store" sheet. Ambiguous items were
// confirmed with the owner (Sinhala කෙන්ත = Kitchen Knife, PICE Tank = Pipe
// Tank, crossed-out brush = Toilet Brush). Dish plates split per size.
const KITCHEN_STORE_ITEMS: ItemSpec[] = [
  { name: 'Freezer', qty: 1, category: 'Appliance' },
  { name: 'Dish Plate (big)', qty: 6, category: 'Utensil' },
  { name: 'Dish Plate (mini)', qty: 6, category: 'Utensil' },
  { name: 'Dish Plate (small)', qty: 6, category: 'Utensil' },
  {
    name: 'Toilet Shower',
    qty: 7,
    category: 'Fixture',
    notes: '3 (packing) + 4 (canbox)',
  },
  {
    name: 'Toilet Cup',
    qty: 2,
    category: 'Fixture',
    notes: 'sizes 7" and 4"',
  },
  {
    name: 'Kitchen Knife',
    qty: 1,
    category: 'Utensil',
    notes: 'Sheet label: කෙන්ත',
  },
  {
    name: 'Pipe Tank (water)',
    qty: 2,
    category: 'Fixture',
    notes: 'Sheet label: PICE Tank',
  },
  { name: 'Commode', qty: 2, category: 'Fixture', notes: 'Sheet label: commords' },
  {
    name: 'Toilet Brush',
    qty: 1,
    category: 'Misc',
    notes: 'Qty not specified on sheet; defaulting to 1',
  },
  { name: 'Speaker', qty: 1, category: 'Electronics', notes: 'Sheet label: speekers' },

  // ---- Added from owner photos (2026-05) ----------------------------------
  // Quantities marked "(est.)" are read off the photos and should be verified
  // against the physical count in the app UI.
  {
    name: 'Serving Platter (oval)',
    qty: 2,
    category: 'Utensil',
    notes: 'Magenta floral; (est.) from photo — verify qty',
  },
  {
    name: 'Rice/Soup Bowl',
    qty: 6,
    category: 'Utensil',
    notes: 'Magenta leaf pattern; counted 6 in photo (2 stacks of 3)',
  },
  {
    name: 'Tea Cup',
    qty: 6,
    category: 'Utensil',
    notes: 'Gold-rim KE porcelain set; (est.) from photo — verify qty',
  },
  {
    name: 'Tea Saucer',
    qty: 6,
    category: 'Utensil',
    notes: 'Gold-rim KE porcelain set; (est.) from photo — verify qty',
  },
  {
    name: 'Drinking Glass',
    qty: 10,
    category: 'Utensil',
    notes: 'Clear tumbler; (est.) from photo — verify qty',
  },
  {
    name: 'Stainless Steel Basin',
    qty: 2,
    category: 'Utensil',
    notes: 'Large steel basin/tray; (est.) from photo — verify qty',
  },
  {
    name: 'Electric Appliance (BIXTON)',
    qty: 1,
    category: 'Appliance',
    notes: 'BIXTON branded boxes in photo; exact type/qty to be confirmed',
  },
  {
    name: 'Flexible Connector Hose',
    qty: 3,
    category: 'Fixture',
    notes: 'Red + white + maroon; counted 3 in photo',
  },
  {
    name: 'Cistern Pull Chain',
    qty: 1,
    category: 'Fixture',
    notes: 'Metal pull chain',
  },
  {
    name: 'P-Trap (waste bend pipe)',
    qty: 1,
    category: 'Fixture',
    notes: 'White waste bend',
  },
  {
    name: 'Toilet Fixing Bolt Set',
    qty: 1,
    category: 'Fixture',
    notes: 'Blue blister pack',
  },
  {
    name: 'Water Tec Flexible Hose (boxed)',
    qty: 1,
    category: 'Fixture',
    notes: 'Boxed, new',
  },
];

function main() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  // ----- Floor 1 -----
  const floor1 = db.prepare('select id from floors where level = 1').get() as
    | { id: string }
    | undefined;
  if (!floor1) throw new Error('Floor 1 not found');

  // ----- Create "Kitchen store" if missing -----
  let kitchenStore = db
    .prepare('select id from locations where slug = ?')
    .get('kitchen-store') as { id: string } | undefined;

  if (!kitchenStore) {
    const newId = randomUUID();
    // Place just below the existing "Kitchen" (900,720) so they read as a pair.
    db.prepare(
      `insert into locations
         (id, floor_id, name, slug, shape, shape_data, color, display_order)
       values
         (?, ?, 'Kitchen store', 'kitchen-store', 'rect', ?, '#B45309', 10)`,
    ).run(
      newId,
      floor1.id,
      JSON.stringify({ x: 900, y: 850, width: 200, height: 100, rotation: 0 }),
    );
    kitchenStore = { id: newId };
    console.log(`  ✓ Created location "Kitchen store" (id=${newId})`);
  } else {
    console.log('  • "Kitchen store" already exists — keeping it');
  }

  // ----- Categories -----
  const ensureCategory = (name: string): string => {
    const existing = db
      .prepare('select id from categories where name = ?')
      .get(name) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = randomUUID();
    db.prepare('insert into categories (id, name) values (?, ?)').run(id, name);
    return id;
  };

  // ----- Items -----
  let inserted = 0;
  let skipped = 0;

  const auditInsert = db.prepare(`
    insert into audit_log (id, entity_type, entity_id, action, after, user_email)
    values (?, 'item', ?, 'create', ?, ?)
  `);

  const tx = db.transaction(() => {
    console.log(
      `\nInserting ${KITCHEN_STORE_ITEMS.length} items into Kitchen store:`,
    );
    for (const spec of KITCHEN_STORE_ITEMS) {
      const existing = db
        .prepare(
          'select id from items where location_id = ? and lower(name) = lower(?) and deleted_at is null',
        )
        .get(kitchenStore!.id, spec.name);
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
      ).run(itemId, kitchenStore!.id, catId, spec.name, spec.qty, spec.notes ?? null);
      auditInsert.run(
        randomUUID(),
        itemId,
        JSON.stringify({
          name: spec.name,
          qty: spec.qty,
          category: spec.category,
          source: 'add-kitchen-store',
        }),
        ADMIN_EMAIL,
      );
      console.log(`  ✓ ${spec.name.padEnd(22)} × ${spec.qty}`);
      inserted++;
    }
  });
  tx();

  // ----- Summary -----
  const summary = db
    .prepare(
      `select l.name, l.slug, l.qr_code,
              count(i.id) as kinds,
              coalesce(sum(i.qty), 0) as total
       from locations l
       left join items i on i.location_id = l.id and i.deleted_at is null
       where l.slug = 'kitchen-store'
       group by l.id`,
    )
    .all();

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}\n`);
  console.table(summary);

  db.close();
}

main();
