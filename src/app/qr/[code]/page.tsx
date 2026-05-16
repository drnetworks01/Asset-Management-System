import { notFound, redirect } from 'next/navigation';
import { getItemByQrCode } from '@/lib/queries/qr';

export const dynamic = 'force-dynamic';

export default async function QrRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const item = await getItemByQrCode(code.toUpperCase());
  if (!item) notFound();
  // Route into the floor plan with that location's drawer pre-opened.
  redirect(`/items?focus=${item.id}`);
}
