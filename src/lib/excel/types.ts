export type RawExcelRow = {
  rowNumber: number;
  sheet: string;
  index: string | number | null;
  locationRaw: string | null;
  itemRaw: string | null;
  categoryRaw: string | null;
  qtyRaw: string | number | null;
  conditionRaw: string | null;
  notesRaw: string | null;
};

export type ParsedExcelResult = {
  rows: RawExcelRow[];
  totalRows: number;
  sheetsProcessed: string[];
};
