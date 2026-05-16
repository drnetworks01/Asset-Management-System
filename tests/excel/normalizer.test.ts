import { describe, it, expect } from 'vitest';
import { normalizeRow, normalizeAll } from '@/lib/excel/normalizer';
import type { RawExcelRow } from '@/lib/excel/types';

function raw(overrides: Partial<RawExcelRow>): RawExcelRow {
  return {
    rowNumber: 2,
    sheet: 'All Assets',
    index: 1,
    locationRaw: 'Canteen',
    itemRaw: 'Chair',
    categoryRaw: 'Chair',
    qtyRaw: 1,
    conditionRaw: 'Good',
    notesRaw: null,
    ...overrides,
  };
}

describe('normalizeRow', () => {
  it('replaces unicode replacement character with em-dash', () => {
    const result = normalizeRow(raw({ itemRaw: 'Chair � Black (plastic)' }));
    expect(result.itemName).toBe('Chair — Black (plastic)');
  });

  it('lowercases and maps Good → good', () => {
    expect(normalizeRow(raw({ conditionRaw: 'Good' })).condition).toBe('good');
    expect(normalizeRow(raw({ conditionRaw: 'GOOD' })).condition).toBe('good');
    expect(normalizeRow(raw({ conditionRaw: '  good ' })).condition).toBe('good');
  });

  it('maps Broken variants → broken', () => {
    expect(normalizeRow(raw({ conditionRaw: 'Broken' })).condition).toBe('broken');
    expect(normalizeRow(raw({ conditionRaw: 'broken' })).condition).toBe('broken');
  });

  it('defaults qty to 1 when null/invalid', () => {
    expect(normalizeRow(raw({ qtyRaw: null })).qty).toBe(1);
    expect(normalizeRow(raw({ qtyRaw: 'abc' })).qty).toBe(1);
    expect(normalizeRow(raw({ qtyRaw: 5 })).qty).toBe(5);
  });

  it('trims whitespace from text fields', () => {
    const result = normalizeRow(
      raw({
        locationRaw: '  Canteen  ',
        categoryRaw: ' Chair ',
      }),
    );
    expect(result.locationName).toBe('Canteen');
    expect(result.categoryName).toBe('Chair');
  });

  it('returns null category when blank', () => {
    expect(normalizeRow(raw({ categoryRaw: null })).categoryName).toBeNull();
    expect(normalizeRow(raw({ categoryRaw: '   ' })).categoryName).toBeNull();
  });

  it('generates location slug from name', () => {
    expect(normalizeRow(raw({ locationRaw: 'Boys Hostal — Block 01' })).locationSlug).toBe(
      'boys-hostal-block-01',
    );
    expect(normalizeRow(raw({ locationRaw: 'Rest Room (CEO)' })).locationSlug).toBe(
      'rest-room-ceo',
    );
  });
});

describe('normalizeAll', () => {
  it('skips rows with empty item name', () => {
    const rows = [raw({ itemRaw: null }), raw({ itemRaw: 'Chair' })];
    expect(normalizeAll(rows)).toHaveLength(1);
  });
});
