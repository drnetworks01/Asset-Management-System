/**
 * Apply the real Kurikaralanka campus layout (from Dumindu's hand-drawn plan)
 * to the locations table.
 *
 * Re-runnable: matches existing rows by slug, only updates shape/shape_data/floor.
 * Does NOT modify items.
 *
 * Run:   pnpm tsx scripts/apply-real-layout.ts
 */

import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'data/kurikara.db');

type Pt = { x: number; y: number };
type Layout = {
  slug: string;
  floor: 1 | 2 | 3;
  shape: 'rect' | 'circle' | 'polygon';
  x: number;
  y: number;
  width: number;
  height: number;
  /** for polygon: relative points {x,y} from origin (x,y). */
  points?: Pt[];
  color?: string;
};

/**
 * Coordinates approximated from the sketch (1600×1400 canvas, N = up).
 * Adjust later via Designer Mode in the UI; this is the seed positioning.
 */
const LAYOUT: Layout[] = [
  // -------- FLOOR 1 (Ground) --------
  {
    slug: 'office',
    floor: 1,
    shape: 'polygon',
    x: 180,
    y: 880,
    width: 360,
    height: 280,
    // L-shape: top runs longer to the right, bottom is short stub on left
    points: [
      { x: 0, y: 60 },
      { x: 280, y: 60 },
      { x: 320, y: 100 },
      { x: 320, y: 280 },
      { x: 80, y: 280 },
      { x: 80, y: 140 },
      { x: 0, y: 140 },
    ],
    color: '#0F766E',
  },

  // Boys hostel — 4 stacked rectangles forming the main vertical block on the left-center
  {
    slug: 'boys-hostal-block-01',
    floor: 1,
    shape: 'rect',
    x: 420,
    y: 500,
    width: 200,
    height: 90,
    color: '#0F766E',
  },
  {
    slug: 'boys-hostal-block-02',
    floor: 1,
    shape: 'rect',
    x: 420,
    y: 600,
    width: 200,
    height: 90,
    color: '#0F766E',
  },
  {
    slug: 'boys-hostal-block-03',
    floor: 1,
    shape: 'rect',
    x: 420,
    y: 700,
    width: 200,
    height: 90,
    color: '#0F766E',
  },
  {
    slug: 'boys-hostal-block-04',
    floor: 1,
    shape: 'rect',
    x: 420,
    y: 800,
    width: 200,
    height: 90,
    color: '#0F766E',
  },

  // Kitchen + Canteen + storage on the right wing of the main building
  {
    slug: 'kitchen',
    floor: 1,
    shape: 'rect',
    x: 900,
    y: 720,
    width: 170,
    height: 180,
    color: '#F59E0B',
  },
  {
    slug: 'canteen',
    floor: 1,
    shape: 'polygon',
    x: 700,
    y: 480,
    width: 360,
    height: 220,
    // Pentagon-ish (matches the open hall in the middle of the sketch)
    points: [
      { x: 60, y: 0 },
      { x: 300, y: 0 },
      { x: 360, y: 110 },
      { x: 300, y: 220 },
      { x: 60, y: 220 },
      { x: 0, y: 110 },
    ],
    color: '#0F766E',
  },
  {
    slug: 'stock-room',
    floor: 1,
    shape: 'rect',
    x: 1140,
    y: 380,
    width: 240,
    height: 260,
    color: '#0F766E',
  },
  {
    slug: 'store-room',
    floor: 1,
    shape: 'rect',
    x: 1140,
    y: 800,
    width: 240,
    height: 90,
    color: '#0F766E',
  },
  {
    slug: 'dormitory-other',
    floor: 1,
    shape: 'rect',
    x: 1140,
    y: 900,
    width: 240,
    height: 60,
    color: '#0F766E',
  },

  // Security / CCTV — small box near the entry (top-right approach)
  {
    slug: 'security-cctv',
    floor: 1,
    shape: 'rect',
    x: 1280,
    y: 80,
    width: 100,
    height: 70,
    color: '#F59E0B',
  },

  // Domestics — small octagonal/well-like structure in the middle (between buildings)
  {
    slug: 'domestics',
    floor: 1,
    shape: 'circle',
    x: 520,
    y: 360,
    width: 100,
    height: 100,
    color: '#0F766E',
  },

  // Hostal — General (unspecified building space, floor 1 catch-all)
  {
    slug: 'hostal-general',
    floor: 1,
    shape: 'rect',
    x: 1140,
    y: 980,
    width: 240,
    height: 60,
    color: '#0F766E',
  },

  // -------- FLOOR 2 --------
  // Girls Hostal — stacked above Boys (same footprint)
  {
    slug: 'girls-hostal-room-a',
    floor: 2,
    shape: 'rect',
    x: 420,
    y: 500,
    width: 200,
    height: 90,
    color: '#F59E0B',
  },
  {
    slug: 'girls-hostal-room-b',
    floor: 2,
    shape: 'rect',
    x: 420,
    y: 600,
    width: 200,
    height: 90,
    color: '#F59E0B',
  },
  {
    slug: 'girls-hostal-room-c',
    floor: 2,
    shape: 'rect',
    x: 420,
    y: 700,
    width: 200,
    height: 90,
    color: '#F59E0B',
  },
  {
    slug: 'girls-hostal-common',
    floor: 2,
    shape: 'rect',
    x: 420,
    y: 800,
    width: 200,
    height: 90,
    color: '#F59E0B',
  },

  // Class Room A — long vertical strip on the far-left (2nd floor)
  {
    slug: 'class-room-a',
    floor: 2,
    shape: 'rect',
    x: 220,
    y: 460,
    width: 130,
    height: 460,
    color: '#0F766E',
  },

  // Class Room B — square at the bottom-right (2nd floor)
  {
    slug: 'class-room-b',
    floor: 2,
    shape: 'rect',
    x: 940,
    y: 1080,
    width: 200,
    height: 200,
    color: '#0F766E',
  },

  // -------- FLOOR 3 --------
  // Rest Room (CEO / Teachers) — isolated top-left
  {
    slug: 'rest-room-ceo',
    floor: 3,
    shape: 'rect',
    x: 200,
    y: 180,
    width: 180,
    height: 140,
    color: '#F59E0B',
  },
];

async function main() {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  const floors = db
    .prepare('select id, level from floors')
    .all() as Array<{ id: string; level: number }>;
  const floorByLevel = new Map(floors.map((f) => [f.level, f.id]));

  if (!floorByLevel.has(1) || !floorByLevel.has(2) || !floorByLevel.has(3)) {
    throw new Error('Missing one or more floors (need levels 1, 2, 3).');
  }

  const update = db.prepare(`
    update locations
    set
      floor_id = @floorId,
      shape = @shape,
      shape_data = @shapeData,
      color = @color,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    where slug = @slug
  `);

  let updated = 0;
  let missing: string[] = [];
  const tx = db.transaction((layouts: Layout[]) => {
    for (const l of layouts) {
      const exists = db
        .prepare('select id from locations where slug = ?')
        .get(l.slug);
      if (!exists) {
        missing.push(l.slug);
        continue;
      }
      const floorId = floorByLevel.get(l.floor);
      if (!floorId) continue;
      const shapeData: Record<string, unknown> = {
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        rotation: 0,
      };
      if (l.points) shapeData.points = l.points;
      update.run({
        slug: l.slug,
        floorId,
        shape: l.shape,
        shapeData: JSON.stringify(shapeData),
        color: l.color ?? '#0F766E',
      });
      updated++;
    }
  });

  tx(LAYOUT);

  console.log(`✓ Updated ${updated} locations to real-campus layout`);
  if (missing.length) {
    console.warn(
      `⚠ ${missing.length} layout entries had no matching location row:`,
      missing,
    );
  }

  // Verify floor distribution
  const counts = db
    .prepare(
      `select f.level, count(l.id) as count
       from floors f left join locations l on l.floor_id = f.id
       group by f.id order by f.level`,
    )
    .all();
  console.log('Floor distribution:', counts);

  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
