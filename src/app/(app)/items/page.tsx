import { createClient } from '@/lib/supabase/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

type ItemRow = {
  id: string;
  name: string;
  qty: number;
  condition: string;
  notes: string | null;
  locations: { name: string; slug: string } | null;
  categories: { name: string } | null;
};

export default async function ItemsPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from('items')
    .select(
      `
      id,
      name,
      qty,
      condition,
      notes,
      locations(name, slug),
      categories(name)
    `,
    )
    .order('name', { ascending: true })
    .limit(500);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Error</h1>
        <pre className="mt-4 text-sm text-danger">{error.message}</pre>
      </div>
    );
  }

  const rows = (items ?? []) as unknown as ItemRow[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">All Items</h1>
        <p className="text-sm text-muted-foreground">{rows.length} items</p>
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
              <TableCell>{item.locations?.name ?? '—'}</TableCell>
              <TableCell>{item.categories?.name ?? '—'}</TableCell>
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
