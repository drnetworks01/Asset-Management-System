import 'server-only';
import { eq, sql, isNull, and, desc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';

export type DashboardSnapshot = {
  totalItems: number;
  goodCount: number;
  brokenCount: number;
  repairCount: number;
  locationCount: number;
  categoryCount: number;
  byCategory: Array<{ name: string; count: number; broken: number }>;
  byLocation: Array<{ name: string; slug: string; count: number; broken: number }>;
  topBroken: Array<{
    id: string;
    name: string;
    qty: number;
    locationName: string | null;
  }>;
};

export async function getDashboard(): Promise<DashboardSnapshot> {
  // Single aggregate across all non-deleted items
  const totals = await db
    .select({
      totalItems: sql<number>`coalesce(sum(${schema.items.qty}), 0)`,
      goodCount: sql<number>`coalesce(sum(case when ${schema.items.condition} = 'good' then ${schema.items.qty} else 0 end), 0)`,
      brokenCount: sql<number>`coalesce(sum(case when ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
      repairCount: sql<number>`coalesce(sum(case when ${schema.items.condition} = 'repair' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.items)
    .where(isNull(schema.items.deletedAt));

  const locationCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.locations);

  const categoryCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.categories);

  const byCategory = await db
    .select({
      name: schema.categories.name,
      count: sql<number>`coalesce(sum(${schema.items.qty}), 0)`,
      broken: sql<number>`coalesce(sum(case when ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.categories)
    .leftJoin(
      schema.items,
      and(
        eq(schema.items.categoryId, schema.categories.id),
        isNull(schema.items.deletedAt),
      ),
    )
    .groupBy(schema.categories.id)
    .orderBy(sql`coalesce(sum(${schema.items.qty}), 0) desc`);

  const byLocation = await db
    .select({
      name: schema.locations.name,
      slug: schema.locations.slug,
      count: sql<number>`coalesce(sum(${schema.items.qty}), 0)`,
      broken: sql<number>`coalesce(sum(case when ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.locations)
    .leftJoin(
      schema.items,
      and(
        eq(schema.items.locationId, schema.locations.id),
        isNull(schema.items.deletedAt),
      ),
    )
    .groupBy(schema.locations.id)
    .orderBy(sql`coalesce(sum(${schema.items.qty}), 0) desc`);

  const topBroken = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      locationName: schema.locations.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .where(
      and(eq(schema.items.condition, 'broken'), isNull(schema.items.deletedAt)),
    )
    .orderBy(desc(schema.items.qty))
    .limit(8);

  const t = totals[0] ?? { totalItems: 0, goodCount: 0, brokenCount: 0, repairCount: 0 };

  return {
    totalItems: Number(t.totalItems),
    goodCount: Number(t.goodCount),
    brokenCount: Number(t.brokenCount),
    repairCount: Number(t.repairCount),
    locationCount: Number(locationCount[0]?.count ?? 0),
    categoryCount: Number(categoryCount[0]?.count ?? 0),
    byCategory: byCategory.map((c) => ({
      name: c.name,
      count: Number(c.count),
      broken: Number(c.broken),
    })),
    byLocation: byLocation.map((l) => ({
      name: l.name,
      slug: l.slug,
      count: Number(l.count),
      broken: Number(l.broken),
    })),
    topBroken: topBroken.map((b) => ({
      id: b.id,
      name: b.name,
      qty: b.qty,
      locationName: b.locationName,
    })),
  };
}

export type SearchResult = {
  type: 'item' | 'location' | 'category';
  id: string;
  label: string;
  sublabel?: string;
  href?: string;
};

export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = `%${query.toLowerCase()}%`;
  const out: SearchResult[] = [];

  const locs = await db
    .select({
      id: schema.locations.id,
      name: schema.locations.name,
      slug: schema.locations.slug,
    })
    .from(schema.locations)
    .where(sql`lower(${schema.locations.name}) like ${q}`)
    .limit(10);

  for (const l of locs) {
    out.push({
      type: 'location',
      id: l.id,
      label: l.name,
      sublabel: 'Location',
      href: `/?location=${l.slug}`,
    });
  }

  const cats = await db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories)
    .where(sql`lower(${schema.categories.name}) like ${q}`)
    .limit(10);
  for (const c of cats) {
    out.push({
      type: 'category',
      id: c.id,
      label: c.name,
      sublabel: 'Category',
      href: `/items?category=${encodeURIComponent(c.name)}`,
    });
  }

  const items = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      locationName: schema.locations.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .where(
      and(
        isNull(schema.items.deletedAt),
        sql`lower(${schema.items.name}) like ${q}`,
      ),
    )
    .limit(20);

  for (const i of items) {
    out.push({
      type: 'item',
      id: i.id,
      label: `${i.name} × ${i.qty}`,
      sublabel: `${i.locationName ?? 'No location'} · ${i.condition}`,
      href: `/items?focus=${i.id}`,
    });
  }

  return out;
}
