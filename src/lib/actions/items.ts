'use server';

import { eq, and, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

export type ItemFormState = { error?: string; ok?: boolean };

type ItemInput = {
  locationId: string;
  categoryId: string | null;
  name: string;
  qty: number;
  condition: 'good' | 'broken' | 'repair';
  notes: string | null;
};

async function requireAdminOrStaff() {
  const user = await requireUser();
  if (!user) throw new Error('unauthorized');
  if (!['admin', 'staff'].includes(user.role)) throw new Error('forbidden');
  return user;
}

function parseForm(formData: FormData): ItemInput {
  const locationId = String(formData.get('locationId') ?? '').trim();
  const categoryRaw = String(formData.get('categoryId') ?? '').trim();
  const categoryId = categoryRaw === '' || categoryRaw === 'null' ? null : categoryRaw;
  const name = String(formData.get('name') ?? '').trim();
  const qty = Math.max(0, Number(formData.get('qty') ?? 1) || 1);
  const condition = (String(formData.get('condition') ?? 'good') as ItemInput['condition']);
  const notesRaw = String(formData.get('notes') ?? '').trim();
  const notes = notesRaw === '' ? null : notesRaw;
  return { locationId, categoryId, name, qty, condition, notes };
}

export async function createItemAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const user = await requireAdminOrStaff();
  const input = parseForm(formData);

  if (!input.locationId || !input.name) {
    return { error: 'Location and name are required.' };
  }

  const result = await db
    .insert(schema.items)
    .values(input)
    .returning({ id: schema.items.id });

  await recordAudit({
    entityType: 'item',
    entityId: result[0]?.id,
    action: 'create',
    after: input,
    userEmail: user.email,
  });

  revalidatePath('/');
  revalidatePath('/items');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateItemAction(
  itemId: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const user = await requireAdminOrStaff();
  const input = parseForm(formData);

  const before = await db
    .select()
    .from(schema.items)
    .where(eq(schema.items.id, itemId))
    .limit(1);
  if (!before[0]) return { error: 'Item not found.' };

  await db
    .update(schema.items)
    .set(input)
    .where(eq(schema.items.id, itemId));

  await recordAudit({
    entityType: 'item',
    entityId: itemId,
    action: 'update',
    before: before[0],
    after: input,
    userEmail: user.email,
  });

  revalidatePath('/');
  revalidatePath('/items');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function toggleConditionAction(itemId: string) {
  const user = await requireAdminOrStaff();
  const rows = await db
    .select()
    .from(schema.items)
    .where(and(eq(schema.items.id, itemId), isNull(schema.items.deletedAt)))
    .limit(1);
  const item = rows[0];
  if (!item) return { error: 'Item not found.' };

  const nextCondition = item.condition === 'good' ? 'broken' : 'good';
  await db
    .update(schema.items)
    .set({ condition: nextCondition })
    .where(eq(schema.items.id, itemId));

  await recordAudit({
    entityType: 'item',
    entityId: itemId,
    action: 'update',
    before: { condition: item.condition },
    after: { condition: nextCondition },
    userEmail: user.email,
  });

  revalidatePath('/');
  revalidatePath('/items');
  revalidatePath('/dashboard');
  return { ok: true, condition: nextCondition };
}

export async function deleteItemAction(itemId: string) {
  const user = await requireAdminOrStaff();
  const rows = await db
    .select()
    .from(schema.items)
    .where(eq(schema.items.id, itemId))
    .limit(1);
  if (!rows[0]) return { error: 'Item not found.' };

  // Soft delete
  await db
    .update(schema.items)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(schema.items.id, itemId));

  await recordAudit({
    entityType: 'item',
    entityId: itemId,
    action: 'delete',
    before: rows[0],
    userEmail: user.email,
  });

  revalidatePath('/');
  revalidatePath('/items');
  revalidatePath('/dashboard');
  return { ok: true };
}
