import { Harvest } from '../entities/harvest.entity';

const COLUMNS = [
  'rowType',
  'id',
  'parentBatchId',
  'batch',
  'batchNumber',
  'species',
  'variety',
  'status',
  'greenhouse',
  'plantingDate',
  'harvestDate',
  'cultivationArea',
  'numberOfRows',
  'rowLength',
  'rowSpacing',
  'plantsPerMeter',
  'totalPlants',
  'lostPlants',
  'classA',
  'classB',
  'waste',
  'avgBrix',
  'brixReadings',
  'fruitCount',
  'totalFruitWeight',
  'avgFruitWeight',
  'rowX',
  'rowY',
  'photos',
  'photoUrls',
  'tenantId',
  'createdAt',
  'updatedAt',
] as const;

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

function rowFor(h: Harvest): string[] {
  const rowType = h.parentBatchId == null ? 'BATCH' : 'ENTRY';
  const brix = Array.isArray(h.brixReadings) ? h.brixReadings.join('|') : '';
  const photoUrls = Array.isArray(h.photoUrls) ? h.photoUrls.join('|') : '';

  return [
    rowType,
    h.id ?? '',
    h.parentBatchId ?? '',
    h.batch ?? '',
    h.batchNumber ?? '',
    h.species ?? '',
    h.variety ?? '',
    h.status ?? '',
    h.greenhouse ?? '',
    toDateOnly(h.plantingDate),
    toDateOnly(h.date),
    String(h.cultivationArea ?? 0),
    String(h.numberOfRows ?? 0),
    String(h.rowLength ?? 0),
    String(h.rowSpacing ?? 0),
    String(h.plantsPerMeter ?? 0),
    String(h.totalPlants ?? 0),
    String(h.lostPlants ?? 0),
    String(h.classA ?? 0),
    String(h.classB ?? 0),
    String(h.waste ?? 0),
    String(h.avgBrix ?? 0),
    brix,
    String(h.fruitCount ?? 0),
    String(h.totalFruitWeight ?? 0),
    String(h.avgFruitWeight ?? 0),
    String(h.rowX ?? 0),
    String(h.rowY ?? 0),
    String(h.photos ?? 0),
    photoUrls,
    h.tenantId ?? '',
    toIsoTimestamp(h.createdAt),
    toIsoTimestamp(h.updatedAt),
  ];
}

export function serializeHarvestsToCsv(rows: Harvest[]): string {
  const lines: string[] = [];
  lines.push(COLUMNS.join(','));
  for (const r of rows) {
    lines.push(rowFor(r).map(escapeCell).join(','));
  }
  // UTF-8 BOM prepended so Excel renders diacritics correctly
  return '﻿' + lines.join('\r\n');
}
