import type { RawExcelRow } from './types';

export type NormalizedRow = {
  sheet: string;
  rowNumber: number;
  locationName: string;
  locationSlug: string;
  itemName: string;
  categoryName: string | null;
  qty: number;
  condition: 'good' | 'broken' | 'repair';
  notes: string | null;
};

const CONDITION_MAP: Record<string, NormalizedRow['condition']> = {
  good: 'good',
  broken: 'broken',
  damaged: 'broken',
  repair: 'repair',
  'in repair': 'repair',
};

function clean(str: string): string {
  return str.replace(/�/g, '—').replace(/\s+/g, ' ').trim();
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && v !== null && 'richText' in v) {
    const rt = (v as { richText: Array<{ text: string }> }).richText;
    return rt.map((r) => r.text).join('');
  }
  if (typeof v === 'object' && v !== null && 'text' in v) {
    return String((v as { text: unknown }).text);
  }
  return String(v);
}

export function normalizeRow(raw: RawExcelRow): NormalizedRow {
  const locationName = clean(asString(raw.locationRaw) ?? '');
  const itemName = clean(asString(raw.itemRaw) ?? '');
  const categoryRaw = clean(asString(raw.categoryRaw) ?? '');
  const categoryName = categoryRaw.length ? categoryRaw : null;
  const notesRaw = clean(asString(raw.notesRaw) ?? '');
  const notes = notesRaw.length ? notesRaw : null;

  const qtyParsed =
    raw.qtyRaw == null || raw.qtyRaw === '' ? NaN : Number(raw.qtyRaw);
  const qty = Number.isFinite(qtyParsed) && qtyParsed > 0 ? Math.floor(qtyParsed) : 1;

  const conditionStr = clean(asString(raw.conditionRaw) ?? '').toLowerCase();
  const condition = CONDITION_MAP[conditionStr] ?? 'good';

  return {
    sheet: raw.sheet,
    rowNumber: raw.rowNumber,
    locationName,
    locationSlug: slugify(locationName),
    itemName,
    categoryName,
    qty,
    condition,
    notes,
  };
}

export function normalizeAll(rows: RawExcelRow[]): NormalizedRow[] {
  return rows
    .map(normalizeRow)
    .filter((r) => r.itemName.length > 0 && r.locationName.length > 0);
}
