import ExcelJS from 'exceljs';
import type { ParsedExcelResult, RawExcelRow } from './types';

const SKIP_SHEETS = new Set(['Summary by Location']);

const HEADER_KEYS: Record<string, keyof RawExcelRow> = {
  '#': 'index',
  'Location / Room': 'locationRaw',
  Item: 'itemRaw',
  Category: 'categoryRaw',
  Qty: 'qtyRaw',
  Condition: 'conditionRaw',
  Notes: 'notesRaw',
  'Notes / Model': 'notesRaw',
};

function cellToString(value: ExcelJS.CellValue): string | number | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((r) => r.text).join('');
    }
    if ('text' in value && value.text != null) {
      return String(value.text);
    }
    if ('result' in value && value.result != null) {
      return cellToString(value.result as ExcelJS.CellValue);
    }
  }
  return String(value);
}

export async function parseExcel(filePath: string): Promise<ParsedExcelResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);

  const rows: RawExcelRow[] = [];
  const sheetsProcessed: string[] = [];

  for (const ws of wb.worksheets) {
    if (SKIP_SHEETS.has(ws.name)) continue;
    sheetsProcessed.push(ws.name);

    const headerRow = ws.getRow(1);
    const columnMap = new Map<number, keyof RawExcelRow>();
    headerRow.eachCell((cell, colNumber) => {
      const headerText = String(cell.value ?? '').trim();
      const fieldKey = HEADER_KEYS[headerText];
      if (fieldKey) columnMap.set(colNumber, fieldKey);
    });

    for (let r = 2; r <= ws.rowCount; r++) {
      const xlRow = ws.getRow(r);
      if (xlRow.actualCellCount === 0) continue;

      const parsed: RawExcelRow = {
        rowNumber: r,
        sheet: ws.name,
        index: null,
        locationRaw: null,
        itemRaw: null,
        categoryRaw: null,
        qtyRaw: null,
        conditionRaw: null,
        notesRaw: null,
      };

      columnMap.forEach((field, col) => {
        const value = cellToString(xlRow.getCell(col).value);
        if (field === 'index') {
          parsed.index = value;
        } else if (field === 'qtyRaw') {
          parsed.qtyRaw = value;
        } else {
          (parsed as Record<keyof RawExcelRow, unknown>)[field] =
            value == null ? null : String(value);
        }
      });

      if (parsed.locationRaw || parsed.itemRaw) {
        rows.push(parsed);
      }
    }
  }

  return {
    rows,
    totalRows: rows.length,
    sheetsProcessed,
  };
}
