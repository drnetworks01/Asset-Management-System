import { db, schema } from '@/lib/db/client';
import { asc, eq } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function ItemsPage() {
  const rows = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      locationName: schema.locations.name,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .orderBy(asc(schema.items.name))
    .limit(500);

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
          <span className="text-muted-foreground">{rows.length} total</span>
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
                <span
                  className={
                    item.condition === 'broken'
                      ? 'inline-flex rounded-full bg-danger/15 px-2 py-0.5 text-xs text-danger'
                      : 'inline-flex rounded-full bg-success/15 px-2 py-0.5 text-xs text-success'
                  }
                >
                  {item.condition}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.notes ?? '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
