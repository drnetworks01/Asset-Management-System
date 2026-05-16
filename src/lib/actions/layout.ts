'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';
import type { LocationShapeData } from '@/lib/db/schema';
import { randomUUID } from 'node:crypto';

type LayoutLocation = {
  id: string;
  floorId: string;
  name: string;
  slug: string;
  shape: 'rect' | 'l_shape' | 'circle' | 'polygon';
  shapeData: LocationShapeData;
  color?: string;
  icon?: string | null;
  isNew?: boolean;
  isDeleted?: boolean;
};

export async function saveLayoutAction(
  locations: LayoutLocation[],
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };
  if (user.role !== 'admin') return { ok: false, error: 'admin only' };

  for (const loc of locations) {
    if (loc.isDeleted) {
      // hard delete only if no items reference it; otherwise skip
      const linked = await db
        .select({ id: schema.items.id })
        .from(schema.items)
        .where(eq(schema.items.locationId, loc.id))
        .limit(1);
      if (linked.length === 0) {
        await db.delete(schema.locations).where(eq(schema.locations.id, loc.id));
        await recordAudit({
          entityType: 'location',
          entityId: loc.id,
          action: 'delete',
          userEmail: user.email,
        });
      }
      continue;
    }

    if (loc.isNew) {
      const newId = loc.id.startsWith('new-') ? randomUUID() : loc.id;
      const baseSlug = slugify(loc.name) || `room-${Date.now()}`;
      let slug = baseSlug;
      let n = 1;
      while (
        (await db
          .select()
          .from(schema.locations)
          .where(eq(schema.locations.slug, slug))
          .limit(1)).length > 0
      ) {
        slug = `${baseSlug}-${++n}`;
      }
      await db.insert(schema.locations).values({
        id: newId,
        floorId: loc.floorId,
        name: loc.name,
        slug,
        shape: loc.shape,
        shapeData: loc.shapeData,
        color: loc.color ?? '#0F766E',
        icon: loc.icon ?? null,
      });
      await recordAudit({
        entityType: 'location',
        entityId: newId,
        action: 'create',
        after: loc,
        userEmail: user.email,
      });
    } else {
      await db
        .update(schema.locations)
        .set({
          floorId: loc.floorId,
          name: loc.name,
          shape: loc.shape,
          shapeData: loc.shapeData,
          color: loc.color ?? '#0F766E',
          icon: loc.icon ?? null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.locations.id, loc.id));
      await recordAudit({
        entityType: 'location',
        entityId: loc.id,
        action: 'update',
        after: loc,
        userEmail: user.email,
      });
    }
  }

  revalidatePath('/');
  return { ok: true };
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
