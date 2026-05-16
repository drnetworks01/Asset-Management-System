import 'server-only';
import { eq, isNull, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { generateQrCode } from '@/lib/qr';

/**
 * Lazily fill in qr_code values for any item that doesn't have one yet.
 * Safe to call repeatedly; only assigns codes to items missing them.
 */
export async function ensureQrCodes() {
  const items = await db
    .select({ id: schema.items.id })
    .from(schema.items)
    .where(
      and(isNull(schema.items.qrCode), isNull(schema.items.deletedAt)),
    );
  for (const item of items) {
    let code = generateQrCode();
    // Retry on collision (extremely rare)
    for (let i = 0; i < 5; i++) {
      const existing = await db
        .select({ id: schema.items.id })
        .from(schema.items)
        .where(eq(schema.items.qrCode, code))
        .limit(1);
      if (existing.length === 0) break;
      code = generateQrCode();
    }
    await db
      .update(schema.items)
      .set({ qrCode: code })
      .where(eq(schema.items.id, item.id));
  }
  return items.length;
}

export async function getItemByQrCode(code: string) {
  const rows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      locationName: schema.locations.name,
      locationSlug: schema.locations.slug,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(eq(schema.items.qrCode, code))
    .limit(1);
  return rows[0] ?? null;
}

export async function getItemsForQrPrint(): Promise<
  Array<{ id: string; name: string; qty: number; locationName: string | null; qrCode: string }>
> {
  await ensureQrCodes();
  const rows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      locationName: schema.locations.name,
      qrCode: schema.items.qrCode,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .where(isNull(schema.items.deletedAt))
    .orderBy(schema.items.name);

  return rows
    .filter((r): r is typeof r & { qrCode: string } => !!r.qrCode)
    .map((r) => ({
      id: r.id,
      name: r.name,
      qty: r.qty,
      locationName: r.locationName,
      qrCode: r.qrCode,
    }));
}
