import { NextResponse, type NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import { eq, isNull, asc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const grouping = req.nextUrl.searchParams.get('group') ?? 'all';

  const rows = await db
    .select({
      name: schema.items.name,
      qty: schema.items.qty,
      condition: schema.items.condition,
      notes: schema.items.notes,
      locationName: schema.locations.name,
      categoryName: schema.categories.name,
    })
    .from(schema.items)
    .leftJoin(schema.locations, eq(schema.items.locationId, schema.locations.id))
    .leftJoin(schema.categories, eq(schema.items.categoryId, schema.categories.id))
    .where(isNull(schema.items.deletedAt))
    .orderBy(asc(schema.locations.name), asc(schema.items.name));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Kurikara Assets';
  wb.created = new Date();

  if (grouping === 'location') {
    const byLoc = new Map<string, typeof rows>();
    for (const r of rows) {
      const k = r.locationName ?? 'Unassigned';
      const list = byLoc.get(k) ?? [];
      list.push(r);
      byLoc.set(k, list);
    }
    for (const [loc, items] of byLoc) {
      const ws = wb.addWorksheet(loc.slice(0, 31));
      writeSheet(ws, items);
    }
  } else {
    const ws = wb.addWorksheet('All Items');
    writeSheet(ws, rows);
  }

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buf), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="kurikara-assets-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

type Row = {
  name: string;
  qty: number;
  condition: string;
  notes: string | null;
  locationName: string | null;
  categoryName: string | null;
};

function writeSheet(ws: ExcelJS.Worksheet, rows: Row[]) {
  ws.columns = [
    { header: 'Item', key: 'name', width: 40 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Qty', key: 'qty', width: 8 },
    { header: 'Condition', key: 'condition', width: 12 },
    { header: 'Notes', key: 'notes', width: 36 },
  ];
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' },
  };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const r of rows) {
    const row = ws.addRow({
      name: r.name,
      location: r.locationName ?? '—',
      category: r.categoryName ?? '—',
      qty: r.qty,
      condition: r.condition,
      notes: r.notes ?? '',
    });
    if (r.condition === 'broken') {
      row.getCell('condition').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEE2E2' },
      };
      row.getCell('condition').font = { color: { argb: 'FF991B1B' } };
    }
  }
}
