import { Harvest } from '../entities/harvest.entity';
import { UserRole } from '@common/enums';

interface ColumnDef {
  key: string;
  value: (h: Harvest) => string;
}

function toDateOnly(value: Date | string | null | undefined): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  // string from the date column transformer is already YYYY-MM-DD or full ISO
  return String(value).slice(0, 10);
}

function toIsoTimestamp(value: Date | string | null | undefined): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Single ordered source of truth: each column's key plus how to render it.
// `rowType` was intentionally removed from the export (VSL ticket: not needed).
const COLUMN_DEFS: ColumnDef[] = [
  { key: 'id', value: (h) => h.id ?? '' },
  { key: 'parentBatchId', value: (h) => h.parentBatchId ?? '' },
  { key: 'batch', value: (h) => h.batch ?? '' },
  { key: 'batchNumber', value: (h) => h.batchNumber ?? '' },
  { key: 'species', value: (h) => h.species ?? '' },
  { key: 'variety', value: (h) => h.variety ?? '' },
  { key: 'status', value: (h) => h.status ?? '' },
  { key: 'greenhouse', value: (h) => h.greenhouse ?? '' },
  { key: 'plantingDate', value: (h) => toDateOnly(h.plantingDate) },
  { key: 'harvestDate', value: (h) => toDateOnly(h.date) },
  { key: 'cultivationArea', value: (h) => String(h.cultivationArea ?? 0) },
  { key: 'numberOfRows', value: (h) => String(h.numberOfRows ?? 0) },
  { key: 'rowLength', value: (h) => String(h.rowLength ?? 0) },
  { key: 'rowSpacing', value: (h) => String(h.rowSpacing ?? 0) },
  { key: 'plantsPerMeter', value: (h) => String(h.plantsPerMeter ?? 0) },
  { key: 'totalPlants', value: (h) => String(h.totalPlants ?? 0) },
  { key: 'lostPlants', value: (h) => String(h.lostPlants ?? 0) },
  { key: 'classA', value: (h) => String(h.classA ?? 0) },
  { key: 'classB', value: (h) => String(h.classB ?? 0) },
  { key: 'waste', value: (h) => String(h.waste ?? 0) },
  { key: 'avgBrix', value: (h) => String(h.avgBrix ?? 0) },
  {
    key: 'brixReadings',
    value: (h) =>
      Array.isArray(h.brixReadings) ? h.brixReadings.join('|') : '',
  },
  { key: 'fruitCount', value: (h) => String(h.fruitCount ?? 0) },
  { key: 'totalFruitWeight', value: (h) => String(h.totalFruitWeight ?? 0) },
  { key: 'avgFruitWeight', value: (h) => String(h.avgFruitWeight ?? 0) },
  { key: 'rowX', value: (h) => String(h.rowX ?? 0) },
  { key: 'rowY', value: (h) => String(h.rowY ?? 0) },
  { key: 'photos', value: (h) => String(h.photos ?? 0) },
  {
    key: 'photoUrls',
    value: (h) => (Array.isArray(h.photoUrls) ? h.photoUrls.join('|') : ''),
  },
  { key: 'tenantId', value: (h) => h.tenantId ?? '' },
  { key: 'createdAt', value: (h) => toIsoTimestamp(h.createdAt) },
  { key: 'updatedAt', value: (h) => toIsoTimestamp(h.updatedAt) },
];

export const ALL_EXPORT_COLUMNS = COLUMN_DEFS.map((c) => c.key);

// A column is treated as an ID-type field when it is named 'id' or ends with
// 'Id'. Add an exception here only if a future non-ID column ever ends in 'Id'.
const ID_COLUMN_EXCEPTIONS = new Set<string>();

export function isIdColumn(key: string): boolean {
  if (ID_COLUMN_EXCEPTIONS.has(key)) return false;
  return key === 'id' || key.endsWith('Id');
}

// vGreens admins may export every column; tenant roles never get ID fields.
// This is the security boundary — do not rely on the frontend to hide them.
export function permittedColumnsForRole(role: UserRole): string[] {
  if (role === UserRole.VGREENS_ADMIN) return [...ALL_EXPORT_COLUMNS];
  return ALL_EXPORT_COLUMNS.filter((key) => !isIdColumn(key));
}

export function serializeHarvestsToCsv(
  rows: Harvest[],
  columns: string[],
): string {
  // Honour the canonical column order regardless of the order requested.
  const defs = COLUMN_DEFS.filter((c) => columns.includes(c.key));
  const lines: string[] = [];
  lines.push(defs.map((c) => c.key).join(','));
  for (const r of rows) {
    lines.push(defs.map((c) => escapeCell(c.value(r))).join(','));
  }
  // UTF-8 BOM prepended so Excel renders diacritics correctly
  return '﻿' + lines.join('\r\n');
}
