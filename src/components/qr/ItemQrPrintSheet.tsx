'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Item = {
  id: string;
  name: string;
  qty: number;
  locationName: string | null;
  qrCode: string;
  svg: string; // raw inline SVG markup for the QR
};

type SizePreset = {
  key: 'sm' | 'md' | 'lg' | 'xl';
  label: string;
  qrPx: number;
  perRow: number;
  hint: string;
};

const SIZE_PRESETS: SizePreset[] = [
  { key: 'sm', label: 'Small', qrPx: 90, perRow: 5, hint: '≈ 28 mm · 20 per A4' },
  { key: 'md', label: 'Medium', qrPx: 130, perRow: 4, hint: '≈ 40 mm · 12 per A4' },
  { key: 'lg', label: 'Large', qrPx: 180, perRow: 3, hint: '≈ 55 mm · 6 per A4' },
  { key: 'xl', label: 'Extra Large', qrPx: 240, perRow: 2, hint: '≈ 75 mm · 4 per A4' },
];

export function ItemQrPrintSheet({ items }: { items: Item[] }) {
  const [sizeKey, setSizeKey] = useState<SizePreset['key']>('md');
  const [filter, setFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');

  const size = SIZE_PRESETS.find((p) => p.key === sizeKey)!;

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) {
      if (i.locationName) set.add(i.locationName);
    }
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((i) => {
      if (locationFilter !== 'all' && i.locationName !== locationFilter) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.qrCode.toLowerCase().includes(q) ||
        (i.locationName ?? '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, locationFilter]);

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Size
            </label>
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              {SIZE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSizeKey(p.key)}
                  className={
                    p.key === sizeKey
                      ? 'bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground'
                      : 'bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{size.hint}</p>
          </div>

          <div className="min-w-[160px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location
            </label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Search
            </label>
            <input
              type="search"
              placeholder="Item name, code, or location"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <div className="ml-auto flex flex-col items-end gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <b>{filtered.length}</b> of {items.length}
            </p>
            <Button onClick={() => window.print()}>🖨 Print</Button>
          </div>
        </div>
      </div>

      <div
        className="grid gap-3 print:gap-2"
        style={{
          gridTemplateColumns: `repeat(${size.perRow}, minmax(0, 1fr))`,
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex break-inside-avoid flex-col items-center gap-1 rounded-lg border border-border bg-background p-3 text-center print:border print:border-slate-400 print:bg-white print:text-slate-900"
          >
            <div
              className="rounded-md bg-white p-1"
              style={{ width: size.qrPx, height: size.qrPx }}
              // SVG is sanitized by the qrcode lib's own renderer — safe.
              dangerouslySetInnerHTML={{ __html: item.svg }}
            />
            <p className="line-clamp-2 text-xs font-semibold leading-tight">
              {item.name}
            </p>
            <p className="text-[9px] text-muted-foreground print:text-slate-600">
              {item.locationName ?? '—'} · ×{item.qty}
            </p>
            <p className="font-mono text-[9px] text-muted-foreground print:text-slate-600">
              {item.qrCode}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; }
        }
        /* Make SVG fill its 90/130/180/240 px container */
        .grid svg { width: 100%; height: 100%; display: block; }
      `}</style>
    </>
  );
}
