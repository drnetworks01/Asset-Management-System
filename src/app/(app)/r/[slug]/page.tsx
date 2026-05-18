import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import {
  getLocationBySlug,
  getItemsForLocation,
} from '@/lib/queries/locations';
import { db, schema } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import { cn } from '@/lib/utils';
import { PrintButton } from '@/components/qr/PrintButton';

export const dynamic = 'force-dynamic';

const CONDITION_LABEL = {
  good: { label: '✓ Good', cls: 'bg-success/15 text-success' },
  broken: { label: '⚠ Broken', cls: 'bg-danger/15 text-danger' },
  repair: { label: '🔧 Repair', cls: 'bg-accent/15 text-accent' },
} as const;

export default async function RoomViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  // Pull qr_code + floor metadata
  const meta = (
    await db
      .select({
        qrCode: schema.locations.qrCode,
        floorLevel: schema.floors.level,
        floorName: schema.floors.name,
      })
      .from(schema.locations)
      .innerJoin(schema.floors, eq(schema.locations.floorId, schema.floors.id))
      .where(eq(schema.locations.id, location.id))
      .limit(1)
  )[0];

  const items = await getItemsForLocation(location.id);

  // Group by category
  const byCategory = new Map<string, typeof items>();
  for (const it of items) {
    const k = it.categoryName ?? 'Uncategorized';
    const list = byCategory.get(k) ?? [];
    list.push(it);
    byCategory.set(k, list);
  }
  const groups = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length);

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const goodQty = items.filter((i) => i.condition === 'good').reduce((s, i) => s + i.qty, 0);
  const brokenQty = items.filter((i) => i.condition === 'broken').reduce((s, i) => s + i.qty, 0);
  const repairQty = items.filter((i) => i.condition === 'repair').reduce((s, i) => s + i.qty, 0);

  const qrDataUrl = meta?.qrCode
    ? await QRCode.toDataURL(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010'}/qr/${meta.qrCode}`,
        { margin: 1, scale: 5, color: { dark: '#0F172A', light: '#FFFFFF' } },
      )
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 print:p-0">
      <header className="flex items-start justify-between gap-6 print:gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {meta?.floorName ?? `Floor ${meta?.floorLevel ?? '?'}`}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{location.name}</h1>
          {meta?.qrCode && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Code: {meta.qrCode}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-muted px-3 py-1">
              {totalQty} total items
            </span>
            <span className="rounded-full bg-success/15 px-3 py-1 text-success">
              ✓ {goodQty} good
            </span>
            {brokenQty > 0 && (
              <span className="rounded-full bg-danger/15 px-3 py-1 text-danger">
                ⚠ {brokenQty} broken
              </span>
            )}
            {repairQty > 0 && (
              <span className="rounded-full bg-accent/15 px-3 py-1 text-accent">
                🔧 {repairQty} repair
              </span>
            )}
          </div>
        </div>
        {qrDataUrl && (
          <div className="shrink-0 rounded-lg border border-border bg-white p-2 print:border-slate-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR for ${location.name}`}
              width={120}
              height={120}
            />
          </div>
        )}
      </header>

      <nav className="flex flex-wrap gap-2 text-sm print:hidden">
        <Link
          href="/"
          className="rounded-md border border-border px-3 py-1 hover:bg-muted"
        >
          ← Floor Plan
        </Link>
        <Link
          href={`/items?location=${location.slug}`}
          className="rounded-md border border-border px-3 py-1 hover:bg-muted"
        >
          Edit items in this room
        </Link>
        <PrintButton />
      </nav>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-background/60 p-8 text-center">
          <p className="text-lg font-semibold">No items in this room yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add items via the floor plan or All Items page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([category, list]) => {
            const groupTotal = list.reduce((s, i) => s + i.qty, 0);
            return (
              <section
                key={category}
                className="rounded-xl border border-border bg-background/60 p-4 print:break-inside-avoid"
              >
                <header className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {list.length} kind{list.length === 1 ? '' : 's'} · {groupTotal} total
                  </p>
                </header>
                <ul className="divide-y divide-border">
                  {list.map((item) => {
                    const tone = CONDITION_LABEL[item.condition];
                    return (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.name}</p>
                          {item.notes && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-sm">
                          <span className="tabular-nums">× {item.qty}</span>
                          <span
                            className={cn('rounded-full px-2 py-0.5 text-xs', tone.cls)}
                          >
                            {tone.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
