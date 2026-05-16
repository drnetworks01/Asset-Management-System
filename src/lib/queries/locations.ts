import 'server-only';
import { eq, sql, isNull, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import type { LocationShapeData } from '@/lib/db/schema';

export type LocationWithStats = {
  id: string;
  name: string;
  slug: string;
  shape: 'rect' | 'l_shape' | 'circle' | 'polygon';
  shapeData: LocationShapeData;
  color: string;
  icon: string | null;
  floorId: string;
  floorLevel: number;
  totalItems: number;
  goodCount: number;
  brokenCount: number;
  repairCount: number;
  topItems: string[];
};

export async function getFloors() {
  return db
    .select()
    .from(schema.floors)
    .orderBy(schema.floors.level);
}

/**
 * Returns every location with aggregated condition counts for items
 * (deleted items excluded). Optionally filtered by floor level.
 */
export async function getLocationsWithStats(floorLevel?: number) {
  const rows = await db
    .select({
      id: schema.locations.id,
      name: schema.locations.name,
      slug: schema.locations.slug,
      shape: schema.locations.shape,
      shapeData: schema.locations.shapeData,
      color: schema.locations.color,
      icon: schema.locations.icon,
      floorId: schema.locations.floorId,
      floorLevel: schema.floors.level,
      totalItems: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null then ${schema.items.qty} else 0 end), 0)`,
      goodCount: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'good' then ${schema.items.qty} else 0 end), 0)`,
      brokenCount: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
      repairCount: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'repair' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.locations)
    .innerJoin(schema.floors, eq(schema.locations.floorId, schema.floors.id))
    .leftJoin(schema.items, eq(schema.items.locationId, schema.locations.id))
    .where(
      floorLevel !== undefined
        ? eq(schema.floors.level, floorLevel)
        : undefined,
    )
    .groupBy(schema.locations.id)
    .orderBy(schema.locations.displayOrder);

  // Pull top item names for each location in one extra query for hover preview.
  const locIds = rows.map((r) => r.id);
  const topItemMap = new Map<string, string[]>();
  if (locIds.length > 0) {
    const topItems = await db
      .select({
        locationId: schema.items.locationId,
        name: schema.items.name,
        qty: schema.items.qty,
      })
      .from(schema.items)
      .where(
        and(
          isNull(schema.items.deletedAt),
          sql`${schema.items.locationId} in ${locIds}`,
        ),
      )
      .orderBy(sql`${schema.items.qty} desc`)
      .limit(500);
    for (const ti of topItems) {
      const list = topItemMap.get(ti.locationId) ?? [];
      if (list.length < 3) {
        list.push(`${ti.name} ×${ti.qty}`);
        topItemMap.set(ti.locationId, list);
      }
    }
  }

  return rows.map<LocationWithStats>((r) => ({
    ...r,
    shapeData: r.shapeData as LocationShapeData,
    totalItems: Number(r.totalItems),
    goodCount: Number(r.goodCount),
    brokenCount: Number(r.brokenCount),
    repairCount: Number(r.repairCount),
    topItems: topItemMap.get(r.id) ?? [],
  }));
}

export async function getLocationBySlug(slug: string) {
  const result = await db
    .select()
    .from(schema.locations)
    .where(eq(schema.locations.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getItemsForLocation(locationId: string) {
  return db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(
      schema.categories,
      eq(schema.items.categoryId, schema.categories.id),
    )
    .where(
      and(
        eq(schema.items.locationId, locationId),
        isNull(schema.items.deletedAt),
      ),
    )
    .orderBy(schema.items.name);
}

export type FloorSummary = {
  floorId: string;
  level: number;
  name: string;
  totalItems: number;
  goodCount: number;
  brokenCount: number;
  locationCount: number;
};

export async function getFloorSummaries(): Promise<FloorSummary[]> {
  const rows = await db
    .select({
      floorId: schema.floors.id,
      level: schema.floors.level,
      name: schema.floors.name,
      locationCount: sql<number>`count(distinct ${schema.locations.id})`,
      totalItems: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null then ${schema.items.qty} else 0 end), 0)`,
      goodCount: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'good' then ${schema.items.qty} else 0 end), 0)`,
      brokenCount: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.floors)
    .leftJoin(schema.locations, eq(schema.locations.floorId, schema.floors.id))
    .leftJoin(schema.items, eq(schema.items.locationId, schema.locations.id))
    .groupBy(schema.floors.id)
    .orderBy(schema.floors.level);

  return rows.map((r) => ({
    floorId: r.floorId,
    level: r.level,
    name: r.name,
    locationCount: Number(r.locationCount),
    totalItems: Number(r.totalItems),
    goodCount: Number(r.goodCount),
    brokenCount: Number(r.brokenCount),
  }));
}
