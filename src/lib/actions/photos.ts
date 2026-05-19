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

  // Validate magic bytes — refuse files whose CONTENT isn't a real image,
  // even if the extension claims otherwise (defends against HTML/SVG smuggled
  // as photo.jpg being served back through /api/photos).
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasImageMagic(buffer)) {
    return { ok: false, error: 'not a valid image file' };
  }

  const itemDir = path.join(STORAGE_DIR, itemId);
  await ensureDir(itemDir);

  const stamp = Date.now();
  const filename = `${stamp}${ext}`;
  const fullPath = path.join(itemDir, filename);
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

/**
 * Check the first few bytes of a buffer against well-known image magic
 * numbers. Returns true if the content really is an image format we accept.
 */
function hasImageMagic(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  // JPEG: starts with FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return true;
  }
  // GIF: GIF87a or GIF89a
  if (buf.slice(0, 6).toString('ascii') === 'GIF87a') return true;
  if (buf.slice(0, 6).toString('ascii') === 'GIF89a') return true;
  // WebP: "RIFF????WEBP"
  if (
    buf.slice(0, 4).toString('ascii') === 'RIFF' &&
    buf.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return true;
  }
  return false;
}
