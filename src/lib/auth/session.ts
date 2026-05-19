import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

export type SessionData = {
  userId?: string;
  email?: string;
  role?: 'admin' | 'staff' | 'viewer';
};

// Lazy resolution: we MUST NOT throw at module-load time because Next.js's
// build phase imports this file to collect route metadata. At build time the
// runtime secrets aren't injected yet, so a top-level throw breaks the build.
// Defer the strict check until first use.
function resolvePassword(): string {
  const PASSWORD = process.env.SESSION_PASSWORD;
  if (PASSWORD && PASSWORD.length >= 32) return PASSWORD;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_PASSWORD must be set in production (32+ chars).',
    );
  }
  return 'dev-only-do-not-use-in-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
}

let _sessionOptions: SessionOptions | undefined;
function getSessionOptions(): SessionOptions {
  if (!_sessionOptions) {
    _sessionOptions = {
      password: resolvePassword(),
      cookieName: 'kurikara_session',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      },
    };
  }
  return _sessionOptions;
}

// Re-export as a Proxy-like getter so existing `sessionOptions` imports still
// work but the strict resolution only fires on access.
export const sessionOptions = new Proxy({} as SessionOptions, {
  get(_t, prop) {
    return Reflect.get(getSessionOptions(), prop);
  },
});

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, getSessionOptions());
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return {
    id: session.userId,
    email: session.email ?? '',
    role: session.role ?? 'viewer',
  };
}
