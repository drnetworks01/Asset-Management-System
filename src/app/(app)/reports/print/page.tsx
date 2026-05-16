import { eq, isNull, asc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { PrintButton } from '@/components/qr/PrintButton';

export const dynamic = 'force-dynamic';

type Row = {
  name: string;
  qty: number;
  condition: string;
  notes: string | null;
  locationName: string | null;
  categoryName: string | null;
  unitValueLkr: number | null;
};

export default async function PrintReportPage() {
  const rows: Row[] = await db
    .select({
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      locationName: schema.locations.name,
      categoryName: schema.categories.name,
      unitValueLkr: schema.items.unitValueLkr,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(isNull(schema.items.deletedAt))
    .orderBy(asc(schema.locations.name), asc(schema.items.name));

  const grouped = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r.locationName ?? 'Unassigned';
    const arr = grouped.get(k) ?? [];
    arr.push(r);
    grouped.set(k, arr);
  }

  const totalItems = rows.length;
  const totalBroken = rows.filter((r) => r.condition === 'broken').length;
  const totalValue = rows.reduce(
    (sum, r) => sum + (r.unitValueLkr ?? 0) * r.qty,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 print:p-4">
      <header className="mb-8 flex items-start justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Printable Inventory Report</h1>
          <p className="text-sm text-muted-foreground">
            Use your browser&apos;s print → Save as PDF for a clean A4 export.
          </p>
        </div>
        <PrintButton />
      </header>

      <article className="space-y-6 print:text-slate-900">
        <header className="border-b border-slate-300 pb-4">
          <h1 className="text-3xl font-bold print:text-2xl">Kurikara Assets — Inventory Report</h1>
          <p className="mt-1 text-sm text-muted-foreground print:text-slate-600">
            Generated {new Date().toLocaleString()} · {totalItems} items · {totalBroken} broken
          </p>
          {totalValue > 0 && (
            <p className="mt-1 text-sm font-semibold">
              Total value: LKR {totalValue.toLocaleString()}
            </p>
          )}
        </header>

        {[...grouped.entries()].map(([location, items]) => {
          const broken = items.filter((i) => i.condition === 'broken').length;
          const subtotal = items.reduce(
            (s, i) => s + (i.unitValueLkr ?? 0) * i.qty,
            0,
          );
          return (
            <section key={location} className="break-inside-avoid">
              <header className="mb-2 flex items-baseline justify-between border-b border-slate-200 pb-1">
                <h2 className="text-lg font-bold">{location}</h2>
                <span className="text-sm text-muted-foreground print:text-slate-600">
                  {items.length} items · {broken} broken
                  {subtotal > 0 && ` · LKR ${subtotal.toLocaleString()}`}
                </span>
              </header>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground print:text-slate-600">
                  <tr>
                    <th className="pb-1">Item</th>
                    <th className="pb-1">Category</th>
                    <th className="pb-1 text-right">Qty</th>
                    <th className="pb-1">Condition</th>
                    <th className="pb-1 text-right">Value</th>
                    <th className="pb-1">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t border-slate-200">
                      <td className="py-1 font-medium">{it.name}</td>
                      <td className="py-1 text-muted-foreground print:text-slate-700">
                        {it.categoryName ?? '—'}
                      </td>
                      <td className="py-1 text-right tabular-nums">{it.qty}</td>
                      <td className="py-1">{it.condition}</td>
                      <td className="py-1 text-right tabular-nums">
                        {it.unitValueLkr
                          ? `LKR ${(it.unitValueLkr * it.qty).toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="py-1 text-xs text-muted-foreground print:text-slate-700">
                        {it.notes ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        <footer className="mt-12 border-t border-slate-300 pt-4 text-xs text-muted-foreground print:text-slate-600">
          <div className="flex justify-between">
            <span>Kurikara Assets Inventory · {new Date().getFullYear()}</span>
            <span>Signed: ________________________</span>
          </div>
        </footer>
      </article>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; color: #0f172a !important; }
          nav, header.border-b { display: none !important; }
        }
      `}</style>
    </div>
  );
}
