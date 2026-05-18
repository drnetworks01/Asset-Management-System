import QRCode from 'qrcode';
import { getLocationsForQrPrint } from '@/lib/queries/qr';
import { PrintButton } from '@/components/qr/PrintButton';

export const dynamic = 'force-dynamic';

export default async function RoomQrSheetPage() {
  const rooms = await getLocationsForQrPrint();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010';

  const labels = await Promise.all(
    rooms.map(async (room) => ({
      ...room,
      dataUrl: await QRCode.toDataURL(`${baseUrl}/qr/${room.qrCode}`, {
        margin: 1,
        scale: 6,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }),
    })),
  );

  // Group by floor for clean printing
  const byFloor = new Map<number, typeof labels>();
  for (const l of labels) {
    const list = byFloor.get(l.floorLevel) ?? [];
    list.push(l);
    byFloor.set(l.floorLevel, list);
  }
  const floors = [...byFloor.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:p-0">
      <header className="mb-6 flex items-baseline justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Room QR Labels</h1>
          <p className="text-sm text-muted-foreground">
            {labels.length} room labels · stick one on each room&apos;s door
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Scanning opens the full inventory of that room.
          </p>
        </div>
        <PrintButton />
      </header>

      {floors.map(([level, list]) => (
        <section key={level} className="mb-10 print:mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print:text-slate-700">
            Floor {level} · {list.length} rooms
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3">
            {list.map((room) => (
              <div
                key={room.id}
                className="flex break-inside-avoid items-center gap-3 rounded-xl border border-border bg-background p-4 print:border print:border-slate-300 print:bg-white print:text-slate-900"
              >
                <div className="flex shrink-0 items-center justify-center rounded-md bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.dataUrl}
                    alt={`QR for ${room.name}`}
                    width={140}
                    height={140}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight">{room.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground print:text-slate-600">
                    Floor {room.floorLevel}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground print:text-slate-600">
                    {room.qrCode}
                  </p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5 print:border print:border-slate-300">
                      {room.itemCount} items
                    </span>
                    {room.brokenCount > 0 && (
                      <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">
                        ⚠ {room.brokenCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
