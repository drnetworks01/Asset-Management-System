'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

async function requireAdmin() {
  const user = await requireUser();
  if (!user) throw new Error('unauthorized');
  if (user.role !== 'admin') throw new Error('admin only');
  return user;
}

export type UserFormResult = { ok: boolean; error?: string };

export async function createUserAction(
  _prev: UserFormResult,
  formData: FormData,
): Promise<UserFormResult> {
  const admin = await requireAdmin();

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim() || null;
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'viewer') as
    | 'admin'
    | 'staff'
    | 'viewer';

  if (!email || !password) return { ok: false, error: 'Email + password required.' };
  if (password.length < 6) return { ok: false, error: 'Password must be 6+ chars.' };
  if (!['admin', 'staff', 'viewer'].includes(role)) {
    return { ok: false, error: 'Invalid role.' };
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing[0]) return { ok: false, error: 'Email already exists.' };

  const result = await db
    .insert(schema.users)
    .values({
      email,
      name,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
    })
    .returning({ id: schema.users.id });

  await recordAudit({
    entityType: 'user',
    entityId: result[0]?.id,
    action: 'create',
    after: { email, name, role },
    userEmail: admin.email,
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function updateUserAction(
  userId: string,
  patch: { name?: string | null; role?: 'admin' | 'staff' | 'viewer'; password?: string },
): Promise<UserFormResult> {
  const admin = await requireAdmin();

  const updates: Partial<typeof schema.users.$inferInsert> = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.role) updates.role = patch.role;
  if (patch.password) {
    if (patch.password.length < 6) return { ok: false, error: 'Password too short.' };
    updates.passwordHash = bcrypt.hashSync(patch.password, 10);
  }

  if (Object.keys(updates).length === 0) return { ok: false, error: 'Nothing to update.' };

  await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));

  await recordAudit({
    entityType: 'user',
    entityId: userId,
    action: 'update',
    after: { ...patch, passwordChanged: !!patch.password },
    userEmail: admin.email,
  });

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<UserFormResult> {
  const admin = await requireAdmin();

  // Can't delete self
  const self = await requireUser();
  if (self?.id === userId) return { ok: false, error: 'Cannot delete yourself.' };

  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await recordAudit({
    entityType: 'user',
    entityId: userId,
    action: 'delete',
    userEmail: admin.email,
  });

  revalidatePath('/admin/users');
  return { ok: true };
}
