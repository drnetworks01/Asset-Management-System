import QRCode from 'qrcode';
import { getLocationsForQrPrint } from '@/lib/queries/qr';
import { RoomQrPrintSheet } from '@/components/qr/RoomQrPrintSheet';

export const dynamic = 'force-dynamic';

export default async function RoomQrSheetPage() {
  const rooms = await getLocationsForQrPrint();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010';

  // Render each QR once at very high resolution. The client then sizes the
  // <img> down via CSS — downscaling stays crisp, and we only pay the encode
  // cost once per page load.
  //
  // errorCorrectionLevel: 'H' = 30% recovery — survives scuffs, water stains,
  // and partial peeling on wall-mounted labels.
  const labels = await Promise.all(
    rooms.map(async (room) => ({
      ...room,
      dataUrl: await QRCode.toDataURL(`${baseUrl}/qr/${room.qrCode}`, {
        errorCorrectionLevel: 'H',
        margin: 2, // quiet zone — too small breaks scanning
        scale: 10, // big raster: clean down-scaling at any preset size
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 print:p-0">
      <header className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Room QR Labels</h1>
        <p className="text-sm text-muted-foreground">
          {labels.length} room labels · stick one on each room&apos;s door
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scanning a label opens that room&apos;s full inventory. Pick a size,
          filter to one floor if needed, then Print.
        </p>
      </header>

      <RoomQrPrintSheet rooms={labels} />
    </div>
  );
}
