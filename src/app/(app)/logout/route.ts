import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  session.destroy();
  // Use the request's own origin so the redirect works on any deployment
  // (localhost in dev, https://your-app.fly.dev in prod, custom domains, etc.)
  // without needing NEXT_PUBLIC_SITE_URL to be set.
  const base = req.nextUrl.origin;
  return NextResponse.redirect(new URL('/login', base));
}
