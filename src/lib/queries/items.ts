import 'server-only';
import { eq, desc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';

export async function getItemDetail(itemId: string) {
  const itemRows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      qrCode: schema.items.qrCode,
      unitValueLkr: schema.items.unitValueLkr,
      lowStockThreshold: schema.items.lowStockThreshold,
      locationId: schema.items.locationId,
      categoryId: schema.items.categoryId,
      locationName: schema.locations.name,
      categoryName: schema.categories.name,
      createdAt: schema.items.createdAt,
      updatedAt: schema.items.updatedAt,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.id, itemId))
    .limit(1);

  const item = itemRows[0];
  if (!item) return null;

  const photos = await db
    .select()
    .from(schema.itemPhotos)
    .where(eq(schema.itemPhotos.itemId, itemId))
    .orderBy(desc(schema.itemPhotos.uploadedAt));

  const history = await db
    .select()
    .from(schema.auditLog)
    .where(eq(schema.auditLog.entityId, itemId))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(50);

  const activeAssignment = await db
    .select()
    .from(schema.assignments)
    .where(eq(schema.assignments.itemId, itemId))
    .orderBy(desc(schema.assignments.issuedAt));

  return { item, photos, history, assignments: activeAssignment };
}
