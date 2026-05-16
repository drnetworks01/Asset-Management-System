import { NextResponse, type NextRequest } from 'next/server';

// Lightweight gate: presence of the session cookie is enough to decide which
// way to route. Actual session verification (and DB lookup) happens in server
// components / actions via `requireUser()`.
export function middleware(request: NextRequest) {
  const hasSessionCookie = request.cookies.has('kurikara_session');
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login');

  if (!hasSessionCookie && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasSessionCookie && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/items';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
};
