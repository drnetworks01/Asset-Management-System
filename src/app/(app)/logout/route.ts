import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST() {
  const session = await getSession();
  session.destroy();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3010';
  return NextResponse.redirect(new URL('/login', base));
}
