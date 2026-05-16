'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

export async function issueAssignmentAction(
  itemId: string,
  data: { assigneeName: string; assigneeRole?: string; qty: number; notes?: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };
  if (!['admin', 'staff'].includes(user.role)) return { ok: false, error: 'forbidden' };
  if (!data.assigneeName.trim()) return { ok: false, error: 'name required' };
  if (data.qty < 1) return { ok: false, error: 'qty must be >= 1' };

  const result = await db
    .insert(schema.assignments)
    .values({
      itemId,
      assigneeName: data.assigneeName.trim(),
      assigneeRole: data.assigneeRole?.trim() || null,
      qty: data.qty,
      notes: data.notes?.trim() || null,
      issuedByUserId: user.id,
    })
    .returning({ id: schema.assignments.id });

  await recordAudit({
    entityType: 'item',
    entityId: itemId,
    action: 'update',
    after: { assignmentIssued: { ...data, assignmentId: result[0]?.id } },
    userEmail: user.email,
  });

  revalidatePath(`/items/${itemId}`);
  revalidatePath('/items');
  return { ok: true };
}

export async function returnAssignmentAction(
  assignmentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const rows = await db
    .select()
    .from(schema.assignments)
    .where(eq(schema.assignments.id, assignmentId))
    .limit(1);
  if (!rows[0]) return { ok: false, error: 'not found' };

  await db
    .update(schema.assignments)
    .set({ returnedAt: new Date().toISOString() })
    .where(eq(schema.assignments.id, assignmentId));

  await recordAudit({
    entityType: 'item',
    entityId: rows[0].itemId,
    action: 'update',
    after: { assignmentReturned: assignmentId },
    userEmail: user.email,
  });

  revalidatePath(`/items/${rows[0].itemId}`);
  return { ok: true };
}
