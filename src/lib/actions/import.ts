'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';
import { parseExcel } from '@/lib/excel/parser';
import { normalizeAll, type NormalizedRow } from '@/lib/excel/normalizer';

const TMP_DIR = path.resolve(process.cwd(), 'data/imports');

export type ImportDiff = {
  uploadId: string;
  filename: string;
  totalRows: number;
  added: NormalizedRow[];
  changed: Array<{ before: NormalizedRow; after: NormalizedRow }>;
  unchanged: number;
  orphans: number;
};

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function uploadImportAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; diff?: ImportDiff }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };
  if (user.role !== 'admin') return { ok: false, error: 'admin only' };

  const file = formData.get('xlsx') as File | null;
  if (!file || file.size === 0) return { ok: false, error: 'no file' };
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: 'file too large (max 10MB)' };
  }

  await ensureDir(TMP_DIR);
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fullPath = path.join(TMP_DIR, `${uploadId}.xlsx`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  // Parse + normalize
  const { rows } = await parseExcel(fullPath);
  const normalized = normalizeAll(rows);

  // Index current DB items by (locationName, itemName) for diff
  const currentItems = await db
    .select({
      id: schema.items.id,
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      locationSlug: schema.locations.slug,
      locationName: schema.locations.name,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id));

  const currentKey = (locSlug: string, name: string) =>
    `${locSlug.toLowerCase()}::${name.toLowerCase().trim()}`;
  const currentMap = new Map<string, (typeof currentItems)[number]>();
  for (const c of currentItems) {
    if (c.locationSlug) currentMap.set(currentKey(c.locationSlug, c.name), c);
  }

  const added: NormalizedRow[] = [];
  const changed: Array<{ before: NormalizedRow; after: NormalizedRow }> = [];
  let unchanged = 0;
  const seenKeys = new Set<string>();

  for (const n of normalized) {
    const key = currentKey(n.locationSlug, n.itemName);
    seenKeys.add(key);
    const existing = currentMap.get(key);
    if (!existing) {
      added.push(n);
      continue;
    }
    const isChanged =
      existing.qty !== n.qty ||
      existing.condition !== n.condition ||
      (existing.notes ?? '') !== (n.notes ?? '') ||
      (existing.categoryName ?? '') !== (n.categoryName ?? '');
    if (isChanged) {
      changed.push({
        before: {
          sheet: '',
          rowNumber: 0,
          locationName: existing.locationName ?? '',
          locationSlug: existing.locationSlug ?? '',
          itemName: existing.name,
          qty: existing.qty,
          condition: existing.condition,
          notes: existing.notes,
          categoryName: existing.categoryName,
        },
        after: n,
      });
    } else {
      unchanged++;
    }
  }

  const orphans = currentItems.filter(
    (c) => c.locationSlug && !seenKeys.has(currentKey(c.locationSlug, c.name)),
  ).length;

  const diff: ImportDiff = {
    uploadId,
    filename: file.name,
    totalRows: normalized.length,
    added,
    changed,
    unchanged,
    orphans,
  };

  // Persist diff snapshot for apply
  await fs.writeFile(
    path.join(TMP_DIR, `${uploadId}.json`),
    JSON.stringify({ filename: file.name, diff, normalized }),
  );

  return { ok: true, diff };
}

// Matches the upload-id format generated in uploadImportAction:
//   `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
// e.g. "1716125042-9a3z2k". Anything else is rejected before touching the filesystem.
const UPLOAD_ID_PATTERN = /^\d+-[a-z0-9]{6}$/;

export async function applyImportAction(
  uploadId: string,
): Promise<{ ok: boolean; error?: string; applied?: { added: number; updated: number } }> {
  const user = await requireUser();
  if (!user) return { ok: false, error: 'unauthorized' };
  if (user.role !== 'admin') return { ok: false, error: 'admin only' };

  // Guard against path traversal — uploadId is caller-controlled and used in a
  // filesystem path below. Without this check, "../foo" could read other files.
  if (!UPLOAD_ID_PATTERN.test(uploadId)) {
    return { ok: false, error: 'invalid upload id' };
  }

  const meta = JSON.parse(
    await fs.readFile(path.join(TMP_DIR, `${uploadId}.json`), 'utf8'),
  ) as { filename: string; diff: ImportDiff; normalized: NormalizedRow[] };

  let added = 0;
  let updated = 0;

  // Build location & category lookups
  const allLocs = await db
    .select({ id: schema.locations.id, slug: schema.locations.slug })
    .from(schema.locations);
  const locBySlug = new Map(allLocs.map((l) => [l.slug, l.id]));

  const allCats = await db
    .select({ id: schema.categories.id, name: schema.categories.name })
    .from(schema.categories);
  const catByName = new Map(allCats.map((c) => [c.name, c.id]));

  for (const n of meta.normalized) {
    const locId = locBySlug.get(n.locationSlug);
    if (!locId) continue;

    let catId: string | null = null;
    if (n.categoryName) {
      catId = catByName.get(n.categoryName) ?? null;
      if (!catId) {
        const result = await db
          .insert(schema.categories)
          .values({ name: n.categoryName })
          .returning({ id: schema.categories.id });
        catId = result[0]?.id ?? null;
        if (catId) catByName.set(n.categoryName, catId);
      }
    }

    // Find existing item by location+name match
    const existing = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.locationId, locId));

    const match = existing.find(
      (e) => e.name.toLowerCase().trim() === n.itemName.toLowerCase().trim(),
    );

    if (!match) {
      await db.insert(schema.items).values({
        locationId: locId,
        categoryId: catId,
        name: n.itemName,
        qty: n.qty,
        condition: n.condition,
        notes: n.notes,
      });
      added++;
    } else {
      await db
        .update(schema.items)
        .set({
          qty: n.qty,
          condition: n.condition,
          notes: n.notes,
          categoryId: catId,
        })
        .where(eq(schema.items.id, match.id));
      updated++;
    }
  }

  await db.insert(schema.importRuns).values({
    filename: meta.filename,
    totalRows: meta.normalized.length,
    added,
    updated,
    status: 'applied',
    diffSnapshot: meta.diff as unknown as Record<string, unknown>,
  });

  await recordAudit({
    entityType: 'import',
    action: 'import',
    after: { filename: meta.filename, added, updated },
    userEmail: user.email,
  });

  revalidatePath('/');
  revalidatePath('/items');
  revalidatePath('/dashboard');

  return { ok: true, applied: { added, updated } };
}
