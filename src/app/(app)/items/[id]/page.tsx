import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItemDetail } from '@/lib/queries/items';
import { PhotoGallery } from '@/components/items/PhotoGallery';
import { AuditTimeline } from '@/components/items/AuditTimeline';
import { AssignmentManager } from '@/components/items/AssignmentManager';
import { ValueEditor } from '@/components/items/ValueEditor';

export const dynamic = 'force-dynamic';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getItemDetail(id);
  if (!detail) notFound();
  const { item, photos, history, assignments } = detail;
  const totalValue = item.unitValueLkr ? item.unitValueLkr * item.qty : null;
  const active = assignments.filter((a) => !a.returnedAt);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <Link
          href="/items"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to all items
        </Link>
      </div>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold">{item.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-border bg-background/60 px-3 py-1">
            📍 {item.locationName ?? '—'}
          </span>
          <span className="rounded-full border border-border bg-background/60 px-3 py-1">
            🏷️ {item.categoryName ?? 'Uncategorized'}
          </span>
          <span
            className={
              item.condition === 'broken'
                ? 'rounded-full bg-danger/15 px-3 py-1 text-danger'
                : item.condition === 'repair'
                  ? 'rounded-full bg-accent/15 px-3 py-1 text-accent'
                  : 'rounded-full bg-success/15 px-3 py-1 text-success'
            }
          >
            {item.condition}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            QR · {item.qrCode ?? '—'}
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Quantity
          </p>
          <p className="mt-1 text-3xl font-bold">{item.qty}</p>
          {item.lowStockThreshold !== null &&
            item.lowStockThreshold !== undefined &&
            item.qty <= item.lowStockThreshold && (
              <p className="mt-1 text-xs text-danger">⚠ Below threshold ({item.lowStockThreshold})</p>
            )}
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Unit value (LKR)
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {item.unitValueLkr ? item.unitValueLkr.toLocaleString() : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs uppercase tracking-wider text-primary">
            Total value
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
            {totalValue ? `LKR ${totalValue.toLocaleString()}` : '—'}
          </p>
        </div>
      </section>

      <PhotoGallery itemId={item.id} photos={photos} />

      <ValueEditor
        itemId={item.id}
        unitValueLkr={item.unitValueLkr}
        lowStockThreshold={item.lowStockThreshold}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Assignment {active.length > 0 ? '✓ Currently with someone' : ''}
        </h2>
        <AssignmentManager itemId={item.id} assignments={assignments} qty={item.qty} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">History</h2>
        <AuditTimeline entries={history} />
      </section>

      {item.notes && (
        <section className="rounded-xl border border-border bg-background/60 p-4 text-sm">
          <h3 className="font-semibold">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.notes}</p>
        </section>
      )}
    </div>
  );
}
