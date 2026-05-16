import { NextResponse } from 'next/server';
import { getItemsForLocation } from '@/lib/queries/locations';
import { requireUser } from '@/lib/auth/session';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const items = await getItemsForLocation(id);
  return NextResponse.json({ items });
}
