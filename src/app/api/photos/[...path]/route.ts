import { NextResponse, type NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { requireUser } from '@/lib/auth/session';

const STORAGE_DIR = path.resolve(process.cwd(), 'data/photos');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { path: parts } = await params;
  const safe = parts
    .map((p) => p.replace(/[^a-zA-Z0-9._-]/g, ''))
    .join('/');
  const fullPath = path.join(STORAGE_DIR, safe);
  if (!fullPath.startsWith(STORAGE_DIR)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const data = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const mime =
      ext === '.png'
        ? 'image/png'
        : ext === '.webp'
          ? 'image/webp'
          : ext === '.gif'
            ? 'image/gif'
            : 'image/jpeg';
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
