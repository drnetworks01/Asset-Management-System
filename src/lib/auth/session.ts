import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

export type SessionData = {
  userId?: string;
  email?: string;
  role?: 'admin' | 'staff' | 'viewer';
};

const PASSWORD = process.env.SESSION_PASSWORD;
if (!PASSWORD || PASSWORD.length < 32) {
  // Fallback for dev convenience; in production this MUST come from env.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_PASSWORD must be set in production (32+ chars).',
    );
  }
}

export const sessionOptions: SessionOptions = {
  password:
    PASSWORD && PASSWORD.length >= 32
      ? PASSWORD
      : 'dev-only-do-not-use-in-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  cookieName: 'kurikara_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession() {
  const store = await cookies();
  return getIronSession<SessionData>(store, sessionOptions);
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
