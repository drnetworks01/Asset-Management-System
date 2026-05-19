'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Room = {
  id: string;
  name: string;
  qrCode: string;
  floorLevel: number;
  itemCount: number;
  brokenCount: number;
  dataUrl: string;
};

type SizePreset = {
  key: 'sm' | 'md' | 'lg' | 'xl';
  label: string;
  qrPx: number; // size of the QR image on screen / print
  perRow: number; // grid columns
  perRowPrint: number; // grid columns on A4 print
  hint: string; // physical size hint
};

const SIZE_PRESETS: SizePreset[] = [
  {
    key: 'sm',
    label: 'Small',
    qrPx: 110,
    perRow: 4,
    perRowPrint: 4,
    hint: '≈ 35 mm · 12 per A4',
  },
  {
    key: 'md',
    label: 'Medium',
    qrPx: 160,
    perRow: 3,
    perRowPrint: 3,
    hint: '≈ 50 mm · 9 per A4',
  },
  {
    key: 'lg',
    label: 'Large',
    qrPx: 220,
    perRow: 2,
    perRowPrint: 2,
    hint: '≈ 70 mm · 4 per A4',
  },
  {
    key: 'xl',
    label: 'Extra Large',
    qrPx: 320,
    perRow: 1,
    perRowPrint: 1,
    hint: '≈ 100 mm · 2 per A4',
  },
];

export function RoomQrPrintSheet({ rooms }: { rooms: Room[] }) {
  const [sizeKey, setSizeKey] = useState<SizePreset['key']>('md');
  const [showCounts, setShowCounts] = useState(true);
  const [pageBreakPerFloor, setPageBreakPerFloor] = useState(true);
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');

  const size = SIZE_PRESETS.find((p) => p.key === sizeKey)!;

  const byFloor = useMemo(() => {
    const filtered =
      floorFilter === 'all'
        ? rooms
        : rooms.filter((r) => r.floorLevel === floorFilter);
    const map = new Map<number, Room[]>();
    for (const r of filtered) {
      const list = map.get(r.floorLevel) ?? [];
      list.push(r);
      map.set(r.floorLevel, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [rooms, floorFilter]);

  const floors = useMemo(
    () => [...new Set(rooms.map((r) => r.floorLevel))].sort((a, b) => a - b),
    [rooms],
  );

  const totalShowing = byFloor.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <>
      {/* Toolbar — hidden on print */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          {/* Size picker */}
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

          {/* Floor filter */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Floor
            </label>
            <select
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              value={floorFilter}
              onChange={(e) =>
                setFloorFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value),
                )
              }
            >
              <option value="all">All floors ({rooms.length})</option>
              {floors.map((f) => {
                const count = rooms.filter((r) => r.floorLevel === f).length;
                return (
                  <option key={f} value={f}>
                    Floor {f} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCounts}
                onChange={(e) => setShowCounts(e.target.checked)}
              />
              Show item counts
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pageBreakPerFloor}
                onChange={(e) => setPageBreakPerFloor(e.target.checked)}
              />
              New page per floor
            </label>
          </div>

          <div className="ml-auto flex flex-col items-end gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <b>{totalShowing}</b> rooms
            </p>
            <Button onClick={() => window.print()}>🖨 Print</Button>
          </div>
        </div>
      </div>

      {/* The actual printable sheet */}
      <div
        className="print-sheet"
        style={
          {
            // CSS variable feeds into the grid + image size below — one knob
            // drives both screen and print rendering, no re-render needed.
            ['--qr-px' as string]: `${size.qrPx}px`,
            ['--cols' as string]: String(size.perRow),
            ['--cols-print' as string]: String(size.perRowPrint),
          } as React.CSSProperties
        }
      >
        {byFloor.map(([level, list], floorIdx) => (
          <section
            key={level}
            className={
              pageBreakPerFloor && floorIdx > 0
                ? 'print:break-before-page mb-10 print:mb-0 print:pt-4'
                : 'mb-10 print:mb-6'
            }
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print:text-slate-700">
              Floor {level} · {list.length} {list.length === 1 ? 'room' : 'rooms'}
            </h2>
            <div
              className="grid gap-4 print:gap-3"
              style={{
                gridTemplateColumns:
                  'repeat(var(--cols), minmax(0, 1fr))',
              }}
            >
              {list.map((room) => (
                <div
                  key={room.id}
                  className="flex break-inside-avoid flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center print:border print:border-slate-400 print:bg-white print:text-slate-900"
                >
                  <div className="rounded-md bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={room.dataUrl}
                      alt={`QR for ${room.name}`}
                      style={{
                        width: 'var(--qr-px)',
                        height: 'var(--qr-px)',
                        imageRendering: 'pixelated',
                      }}
                    />
                  </div>
                  <p className="text-base font-bold leading-tight">
                    {room.name}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] text-muted-foreground print:text-slate-600">
                    <span>Floor {room.floorLevel}</span>
                    <span>·</span>
                    <span className="font-mono">{room.qrCode}</span>
                  </div>
                  {showCounts && (
                    <div className="flex gap-1 text-[10px]">
                      <span className="rounded-full bg-muted px-2 py-0.5 print:border print:border-slate-300">
                        {room.itemCount} items
                      </span>
                      {room.brokenCount > 0 && (
                        <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">
                          ⚠ {room.brokenCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; }
          .print-sheet {
            /* Use the print-cols variable when printing */
            --cols: var(--cols-print);
          }
        }
      `}</style>
    </>
  );
}
