import { NextResponse, type NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { searchAll } from '@/lib/queries/dashboard';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length === 0) return NextResponse.json({ results: [] });
  const results = await searchAll(q);
  return NextResponse.json({ results });
}
