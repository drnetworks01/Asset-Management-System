'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

const STORAGE_DIR = path.resolve(process.cwd(), 'data/photos');

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function uploadPhotoAction(
  itemId: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const file = formData.get('photo') as File | null;
  if (!file || file.size === 0) {
    return { ok: false, error: 'no file' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: 'file too large (max 5MB)' };
  }

  const ext = path.extname(file.name).toLowerCase() || '.bin';
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return { ok: false, error: 'unsupported file type' };
  }

  const itemDir = path.join(STORAGE_DIR, itemId);
  await ensureDir(itemDir);

  const stamp = Date.now();
  const filename = `${stamp}${ext}`;
  const fullPath = path.join(itemDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  const storagePath = `${itemId}/${filename}`;
  await db.insert(schema.itemPhotos).values({
    itemId,
    storagePath,
    caption: null,
  });

  await recordAudit({
    entityType: 'item',
    entityId: itemId,
    action: 'update',
    after: { photoAdded: storagePath },
    userEmail: user.email,
  });

  revalidatePath('/items');
  return { ok: true };
}

export async function deletePhotoAction(photoId: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };
  if (user.role !== 'admin') return { ok: false, error: 'admin only' };

  const rows = await db
    .select()
    .from(schema.itemPhotos)
    .where(eq(schema.itemPhotos.id, photoId))
    .limit(1);
  const photo = rows[0];
  if (!photo) return { ok: false, error: 'not found' };

  await db.delete(schema.itemPhotos).where(eq(schema.itemPhotos.id, photoId));
  try {
    await fs.unlink(path.join(STORAGE_DIR, photo.storagePath));
  } catch {
    // file may be missing — ignore
  }
  revalidatePath('/items');
  return { ok: true };
}
