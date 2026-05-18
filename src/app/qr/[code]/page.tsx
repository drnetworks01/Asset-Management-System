import { notFound, redirect } from 'next/navigation';
import { getItemByQrCode, getLocationByQrCode } from '@/lib/queries/qr';
import { classifyQrCode } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export default async function QrRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();

  // Prefix-based dispatch: KH... → item, KR... → room.
  // We still fall through to the other table if the prefix mismatches an existing code (resilient).
  const kind = classifyQrCode(code);

  if (kind === 'item' || kind === 'unknown') {
    const item = await getItemByQrCode(code);
    if (item) redirect(`/items/${item.id}`);
  }

  const location = await getLocationByQrCode(code);
  if (location) redirect(`/r/${location.slug}`);

  // Last-chance: if KH-prefix had no item, try locations (fallback)
  if (kind === 'item') {
    const loc = await getLocationByQrCode(code);
    if (loc) redirect(`/r/${loc.slug}`);
  }

  notFound();
}
