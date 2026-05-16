import QRCode from 'qrcode';
import { getItemsForQrPrint } from '@/lib/queries/qr';
import { PrintButton } from '@/components/qr/PrintButton';

export const dynamic = 'force-dynamic';

export default async function QrSheetPage() {
  const items = await getItemsForQrPrint();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010';

  const labels = await Promise.all(
    items.map(async (item) => ({
      ...item,
      dataUrl: await QRCode.toDataURL(`${baseUrl}/qr/${item.qrCode}`, {
        margin: 1,
        scale: 4,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:p-0">
      <header className="mb-6 flex items-baseline justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold">QR Code Labels</h1>
          <p className="text-sm text-muted-foreground">
            {labels.length} labels · Use browser&apos;s &ldquo;Print&rdquo; to print directly on A4
          </p>
        </div>
        <PrintButton />
      </header>

      <div className="grid grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
        {labels.map((l) => (
          <div
            key={l.id}
            className="break-inside-avoid rounded-lg border border-border bg-background p-3 print:border print:border-slate-300 print:bg-white print:text-slate-900"
          >
            <div className="flex items-center justify-center bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.dataUrl}
                alt={`QR ${l.qrCode}`}
                width={120}
                height={120}
              />
            </div>
            <div className="mt-2 text-center">
              <p className="line-clamp-2 text-xs font-semibold">{l.name}</p>
              <p className="text-[10px] text-muted-foreground print:text-slate-600">
                {l.locationName ?? '—'} · ×{l.qty}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground print:text-slate-600">
                {l.qrCode}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
