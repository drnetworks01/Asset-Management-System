import QRCode from 'qrcode';
import { getItemsForQrPrint } from '@/lib/queries/qr';
import { ItemQrPrintSheet } from '@/components/qr/ItemQrPrintSheet';

export const dynamic = 'force-dynamic';

export default async function QrSheetPage() {
  const items = await getItemsForQrPrint();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010';

  // SVG output: vector → sharp at any zoom + tiny payload vs PNG dataUrl.
  // For 174 items this saves ~1.4 MB of HTML.
  const labels = await Promise.all(
    items.map(async (item) => ({
      ...item,
      svg: await QRCode.toString(`${baseUrl}/qr/${item.qrCode}`, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:p-0">
      <header className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Item QR Code Labels</h1>
        <p className="text-sm text-muted-foreground">
          {labels.length} item labels · Use browser&apos;s &ldquo;Print&rdquo; to print on A4
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a size, filter by location or search, then Print.
        </p>
      </header>

      <ItemQrPrintSheet items={labels} />
    </div>
  );
}
