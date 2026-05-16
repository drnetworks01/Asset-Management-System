import 'server-only';
import { db, schema } from '@/lib/db/client';

export type AuditEntry = {
  entityType: 'item' | 'location' | 'floor' | 'category' | 'import' | 'user';
  entityId?: string | null;
  action: 'create' | 'update' | 'delete' | 'import' | 'revert' | 'login';
  before?: unknown;
  after?: unknown;
  userEmail?: string | null;
};

export async function recordAudit(entry: AuditEntry) {
  await db.insert(schema.auditLog).values({
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
    action: entry.action,
    before: entry.before ?? null,
    after: entry.after ?? null,
    userEmail: entry.userEmail ?? null,
  });
}
