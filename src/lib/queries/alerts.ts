import 'server-only';
import { eq, sql, isNull, and, desc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';

export type Alert = {
  kind: 'broken_threshold' | 'low_stock' | 'high_broken_count';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detail?: string;
  href?: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userEmail: string | null;
  createdAt: string;
  summary: string;
};

export async function getAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // 1. Low stock items
  const lowStock = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      threshold: schema.items.lowStockThreshold,
      locationName: schema.locations.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .where(
      and(
        isNull(schema.items.deletedAt),
        sql`${schema.items.lowStockThreshold} is not null`,
        sql`${schema.items.qty} <= ${schema.items.lowStockThreshold}`,
      ),
    );

  for (const item of lowStock) {
    alerts.push({
      kind: 'low_stock',
      severity: item.qty === 0 ? 'critical' : 'warning',
      message: `Low stock: ${item.name}`,
      detail: `${item.qty} left in ${item.locationName ?? '—'} (threshold ${item.threshold})`,
      href: `/items/${item.id}`,
    });
  }

  // 2. Locations with > 30% broken
  const locStats = await db
    .select({
      locId: schema.locations.id,
      name: schema.locations.name,
      total: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null then ${schema.items.qty} else 0 end), 0)`,
      broken: sql<number>`coalesce(sum(case when ${schema.items.deletedAt} is null and ${schema.items.condition} = 'broken' then ${schema.items.qty} else 0 end), 0)`,
    })
    .from(schema.locations)
    .leftJoin(schema.items, eq(schema.items.locationId, schema.locations.id))
    .groupBy(schema.locations.id);

  for (const loc of locStats) {
    const total = Number(loc.total);
    const broken = Number(loc.broken);
    if (total >= 10) {
      const pct = (broken / total) * 100;
      if (pct >= 30) {
        alerts.push({
          kind: 'broken_threshold',
          severity: pct >= 50 ? 'critical' : 'warning',
          message: `${loc.name}: ${broken}/${total} broken (${Math.round(pct)}%)`,
          detail: 'Consider audit / replacement plan.',
        });
      }
    }
  }

  // 3. Recent broken increase: items marked broken in last 7 days
  const recentBroken = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.auditLog)
    .where(
      and(
        sql`${schema.auditLog.action} = 'update'`,
        sql`json_extract(${schema.auditLog.after}, '$.condition') = 'broken'`,
        sql`${schema.auditLog.createdAt} >= datetime('now', '-7 days')`,
      ),
    );

  const newBroken = Number(recentBroken[0]?.count ?? 0);
  if (newBroken >= 3) {
    alerts.push({
      kind: 'high_broken_count',
      severity: newBroken >= 10 ? 'critical' : 'info',
      message: `${newBroken} items marked broken in the last 7 days`,
      detail: 'Check the activity feed for details.',
    });
  }

  return alerts;
}

export async function getActivityFeed(limit = 20): Promise<ActivityEntry[]> {
  const rows = await db
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId,
    userEmail: r.userEmail,
    createdAt: r.createdAt,
    summary: summarize(r),
  }));
}

function summarize(r: typeof schema.auditLog.$inferSelect): string {
  const e = r.entityType;
  const a = r.action;
  if (e === 'item' && a === 'create') return 'New item added';
  if (e === 'item' && a === 'delete') return 'Item deleted';
  if (e === 'item' && a === 'update') {
    const after = (r.after ?? {}) as Record<string, unknown>;
    if ('condition' in after) {
      return `Condition → ${String(after.condition)}`;
    }
    if ('assignmentIssued' in after) return 'Item issued to someone';
    if ('assignmentReturned' in after) return 'Item returned';
    if ('photoAdded' in after) return 'Photo added';
    if ('bulk' in after) return 'Bulk update';
    return 'Item updated';
  }
  if (e === 'location' && a === 'create') return 'Room added';
  if (e === 'location' && a === 'update') return 'Room layout changed';
  if (e === 'location' && a === 'delete') return 'Room removed';
  if (e === 'user') return `User ${a}d`;
  if (e === 'import') return 'Excel re-import applied';
  return `${e} ${a}`;
}

export async function getTotalValue(): Promise<{
  totalValue: number;
  itemsWithValue: number;
  itemsWithoutValue: number;
}> {
  const result = await db
    .select({
      totalValue: sql<number>`coalesce(sum(${schema.items.unitValueLkr} * ${schema.items.qty}), 0)`,
      withVal: sql<number>`sum(case when ${schema.items.unitValueLkr} is not null then 1 else 0 end)`,
      withoutVal: sql<number>`sum(case when ${schema.items.unitValueLkr} is null then 1 else 0 end)`,
    })
    .from(schema.items)
    .where(isNull(schema.items.deletedAt));

  return {
    totalValue: Number(result[0]?.totalValue ?? 0),
    itemsWithValue: Number(result[0]?.withVal ?? 0),
    itemsWithoutValue: Number(result[0]?.withoutVal ?? 0),
  };
}
