import { describe, it, expect } from 'vitest';
import { parseExcel } from '@/lib/excel/parser';
import path from 'node:path';

const FIXTURE = path.resolve(__dirname, '../fixtures/Office_Assets_v2.xlsx');

describe('parseExcel', () => {
  it('returns rows from all data sheets, skipping the summary', async () => {
    const result = await parseExcel(FIXTURE);

    expect(result.sheetsProcessed).toContain('All Assets');
    expect(result.sheetsProcessed).not.toContain('Summary by Location');
    expect(result.totalRows).toBeGreaterThan(50);
    expect(result.rows[0]).toMatchObject({
      sheet: expect.any(String),
      locationRaw: expect.any(String),
      itemRaw: expect.any(String),
    });
  });

  it('captures raw values without normalizing', async () => {
    const result = await parseExcel(FIXTURE);
    const chairRow = result.rows.find(
      (r) => r.itemRaw?.includes('Chair') && r.itemRaw?.includes('Black'),
    );
    expect(chairRow).toBeDefined();
    expect(typeof chairRow!.itemRaw).toBe('string');
  });
});
