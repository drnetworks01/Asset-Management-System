'use client';

import { useEffect, useState, useMemo } from 'react';
import type { LocationWithStats } from '@/lib/queries/locations';
import { cn } from '@/lib/utils';

type Item = {
  id: string;
  name: string;
  qty: number;
  condition: 'good' | 'broken' | 'repair';
  notes: string | null;
  categoryName: string | null;
};

type Props = {
  open: boolean;
  location: LocationWithStats | null;
  onClose: () => void;
};

export function LocationDrawer({ open, location, onClose }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !location) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);
    fetch(`/api/locations/${location.id}/items`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data.items as Item[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, location]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const k = it.categoryName ?? 'Uncategorized';
      const list = map.get(k) ?? [];
      list.push(it);
      map.set(k, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [items]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {location && (
          <>
            <header className="flex items-start justify-between border-b border-border p-6">
              <div>
                <button
                  onClick={onClose}
                  className="mb-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Close
                </button>
                <h2 className="text-2xl font-bold">{location.name}</h2>
                <div className="mt-2 flex gap-3 text-sm">
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">
                    ✓ {location.goodCount} good
                  </span>
                  {location.brokenCount > 0 && (
                    <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">
                      ⚠ {location.brokenCount} broken
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {location.totalItems} total
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading items…</p>
              )}
              {error && (
                <p className="text-sm text-danger">Failed to load: {error}</p>
              )}
              {!loading && !error && items.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No items in this location.
                </p>
              )}

              <div className="space-y-6">
                {grouped.map(([category, catItems]) => (
                  <section key={category}>
                    <h3 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                      {category} ({catItems.length})
                    </h3>
                    <ul className="space-y-2">
                      {catItems.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-lg border border-border bg-background/60 p-3"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <a
                              href={`/items/${item.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {item.name}
                            </a>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-xs',
                                item.condition === 'broken'
                                  ? 'bg-danger/15 text-danger'
                                  : item.condition === 'repair'
                                    ? 'bg-accent/15 text-accent'
                                    : 'bg-success/15 text-success',
                              )}
                            >
                              {item.condition} × {item.qty}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
