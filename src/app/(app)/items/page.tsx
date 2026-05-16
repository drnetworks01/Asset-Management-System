import { db, schema } from '@/lib/db/client';
import { asc, eq, isNull } from 'drizzle-orm';
import { ItemsTable } from '@/components/items/ItemsTable';
import { getLocationsList, getCategoriesList } from '@/lib/queries/meta';

export const dynamic = 'force-dynamic';

export default async function ItemsPage() {
  const [rows, locations, categories] = await Promise.all([
    db
      .select({
        id: schema.items.id,
        name: schema.items.name,
        qty: schema.items.qty,
        condition: schema.items.condition,
        notes: schema.items.notes,
        locationId: schema.items.locationId,
        categoryId: schema.items.categoryId,
        locationName: schema.locations.name,
        categoryName: schema.categories.name,
      })
      .from(schema.items)
      .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
      .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
      .where(isNull(schema.items.deletedAt))
      .orderBy(asc(schema.items.name))
      .limit(500),
    getLocationsList(),
    getCategoriesList(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ItemsTable rows={rows} locations={locations} categories={categories} />
    </div>
  );
}
