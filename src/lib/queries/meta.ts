import 'server-only';
import { db, schema } from '@/lib/db/client';

export async function getLocationsList() {
  return db
    .select({
      id: schema.locations.id,
      name: schema.locations.name,
      slug: schema.locations.slug,
    })
    .from(schema.locations)
    .orderBy(schema.locations.name);
}

export async function getCategoriesList() {
  return db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories)
    .orderBy(schema.categories.name);
}
