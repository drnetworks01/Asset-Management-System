import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { requireUser } from '@/lib/auth/session';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);

export async function GET() {
  const user = await requireUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'admin only' }, { status: 403 });
  }

  const data = await fs.readFile(DB_PATH);
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="kurikara-backup-${stamp}.db"`,
      'Cache-Control': 'no-store',
    },
  });
}
