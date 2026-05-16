'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db, schema } from '@/lib/db/client';
import { getSession } from './session';

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  const user = result[0];
  if (!user) return { error: 'Invalid credentials.' };

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return { error: 'Invalid credentials.' };

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  await session.save();

  redirect('/items');
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
