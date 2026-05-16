import { db, schema } from '@/lib/db/client';
import { asc, eq, isNull } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AddItemButton,
  ItemActionsRow,
} from '@/components/items/ItemActions';
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

  const brokenCount = rows.filter((r) => r.condition === 'broken').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Items</h1>
          <p className="text-sm text-muted-foreground">
            Imported from <code>Office_Assets_v2.xlsx</code>
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="rounded-full bg-success/15 px-3 py-1 text-success">
            ✓ {rows.length - brokenCount} good
          </span>
          <span className="rounded-full bg-danger/15 px-3 py-1 text-danger">
            ⚠ {brokenCount} broken
          </span>
          <span className="text-muted-foreground">{rows.length} rows</span>
          <AddItemButton locations={locations} categories={categories} />
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.locationName ?? '—'}</TableCell>
              <TableCell>{item.categoryName ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
              <TableCell>
                <ItemActionsRow
                  item={{
                    id: item.id,
                    name: item.name,
                    qty: item.qty,
                    condition: item.condition,
                    notes: item.notes,
                    locationId: item.locationId,
                    categoryId: item.categoryId,
                  }}
                  locations={locations}
                  categories={categories}
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.notes ?? '—'}
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
