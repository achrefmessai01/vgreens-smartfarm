import { Harvest } from '../entities/harvest.entity';
import { UserRole } from '@common/enums';

interface ColumnDef {
  key: string;
  value: (h: Harvest) => string;
}

function toDateOnly(value: Date | string | null | undefined): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toIsoTimestamp(value: Date | string | null | undefined): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function num(value: number | null | undefined): string {
  return value == null ? '' : String(value);
}

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// One ordered source of truth. Planting fields are read from the joined batch;
// measurement figures from the service-computed `totals` (populated by
// findAllForExport). brixReadings are flattened from the entries as class:value
// pairs joined with '|'.
const COLUMN_DEFS: ColumnDef[] = [
  { key: 'id', value: (h) => h.id ?? '' },
  { key: 'batchId', value: (h) => h.batchId ?? '' },
  { key: 'batch', value: (h) => h.batch?.name ?? '' },
  { key: 'batchNumber', value: (h) => h.batch?.batchNumber ?? '' },
  { key: 'species', value: (h) => h.batch?.crop?.name ?? '' },
  { key: 'variety', value: (h) => h.batch?.variety?.name ?? '' },
  { key: 'status', value: (h) => h.batch?.status ?? '' },
  { key: 'greenhouse', value: (h) => h.batch?.greenhouse?.name ?? '' },
  { key: 'plantingDate', value: (h) => toDateOnly(h.batch?.plantingDate) },
  { key: 'harvestDate', value: (h) => toDateOnly(h.date) },
  { key: 'cultivationArea', value: (h) => num(h.batch?.cultivationArea) },
  { key: 'numberOfRows', value: (h) => num(h.batch?.numberOfRows) },
  { key: 'rowLength', value: (h) => num(h.batch?.rowLength) },
  { key: 'rowSpacing', value: (h) => num(h.batch?.rowSpacing) },
  { key: 'plantsPerMeter', value: (h) => num(h.batch?.plantsPerMeter) },
  { key: 'totalPlants', value: (h) => num(h.batch?.totalPlants) },
  { key: 'lostPlants', value: (h) => num(h.batch?.lostPlants) },
  { key: 'classA', value: (h) => num(h.totals?.classA) },
  { key: 'classB', value: (h) => num(h.totals?.classB) },
  { key: 'classC', value: (h) => num(h.totals?.classC) },
  { key: 'waste', value: (h) => num(h.totals?.waste) },
  { key: 'avgBrix', value: (h) => num(h.totals?.avgBrix) },
  {
    key: 'brixReadings',
    value: (h) =>
      (h.entries ?? [])
        .flatMap((e) =>
          (e.brixReadings ?? []).map((b) => `${b.class}:${b.value}`),
        )
        .join('|'),
  },
  { key: 'fruitCount', value: (h) => num(h.totals?.fruitCount) },
  { key: 'totalFruitWeight', value: (h) => num(h.totals?.totalFruitWeight) },
  { key: 'avgFruitWeight', value: (h) => num(h.totals?.avgFruitWeight) },
  { key: 'yieldPerPlant', value: (h) => num(h.totals?.yieldPerPlant) },
  { key: 'yieldPerMeter', value: (h) => num(h.totals?.yieldPerMeter) },
  {
    key: 'photoUrls',
    value: (h) => (Array.isArray(h.photoUrls) ? h.photoUrls.join('|') : ''),
  },
  { key: 'tenantId', value: (h) => h.tenantId ?? '' },
  { key: 'createdById', value: (h) => h.createdById ?? '' },
  { key: 'createdAt', value: (h) => toIsoTimestamp(h.createdAt) },
  { key: 'updatedAt', value: (h) => toIsoTimestamp(h.updatedAt) },
];

export const ALL_EXPORT_COLUMNS = COLUMN_DEFS.map((c) => c.key);

const ID_COLUMN_EXCEPTIONS = new Set<string>();

export function isIdColumn(key: string): boolean {
  if (ID_COLUMN_EXCEPTIONS.has(key)) return false;
  return key === 'id' || key.endsWith('Id');
}

// vGreens admins may export every column; tenant roles never get ID fields.
export function permittedColumnsForRole(role: UserRole): string[] {
  if (role === UserRole.VGREENS_ADMIN) return [...ALL_EXPORT_COLUMNS];
  return ALL_EXPORT_COLUMNS.filter((key) => !isIdColumn(key));
}

export function serializeHarvestsToCsv(
  rows: Harvest[],
  columns: string[],
): string {
  const defs = COLUMN_DEFS.filter((c) => columns.includes(c.key));
  const lines: string[] = [];
  lines.push(defs.map((c) => c.key).join(','));
  for (const r of rows) {
    lines.push(defs.map((c) => escapeCell(c.value(r))).join(','));
  }
  // UTF-8 BOM prepended so Excel renders diacritics correctly.
  return '﻿' + lines.join('\r\n');
}
