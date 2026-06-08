// Column keys in canonical CSV order. MUST stay in sync with COLUMN_DEFS in the
// backend csv.util.ts. `rowType` is intentionally excluded from the export.
export const EXPORT_COLUMN_KEYS = [
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

export type ExportColumnKey = (typeof EXPORT_COLUMN_KEYS)[number];

const ID_COLUMN_EXCEPTIONS = new Set<string>();

// Mirrors the backend isIdColumn: a column is an ID-type field when named 'id'
// or ending in 'Id'.
export function isIdColumn(key: string): boolean {
  if (ID_COLUMN_EXCEPTIONS.has(key)) return false;
  return key === 'id' || key.endsWith('Id');
}

// UX mirror of the backend's permittedColumnsForRole — hides what the backend
// would strip anyway. The backend remains the enforcement point.
export function availableExportColumns(
  isVGreensAdmin: boolean,
): ExportColumnKey[] {
  if (isVGreensAdmin) return [...EXPORT_COLUMN_KEYS];
  return EXPORT_COLUMN_KEYS.filter((key) => !isIdColumn(key));
}

// English fallbacks; i18n exportColumnLabels[key] overrides when present.
export const DEFAULT_COLUMN_LABELS: Record<ExportColumnKey, string> = {
  id: 'ID',
  parentBatchId: 'Parent Batch ID',
  batch: 'Batch',
  batchNumber: 'Batch Number',
  species: 'Crop',
  variety: 'Variety',
  status: 'Status',
  greenhouse: 'Greenhouse',
  plantingDate: 'Planting Date',
  harvestDate: 'Harvest Date',
  cultivationArea: 'Cultivation Area (m²)',
  numberOfRows: 'Number of Rows',
  rowLength: 'Row Length (m)',
  rowSpacing: 'Row Spacing',
  plantsPerMeter: 'Plants per Meter',
  totalPlants: 'Total Plants',
  lostPlants: 'Lost Plants',
  classA: 'Class A (kg)',
  classB: 'Class B (kg)',
  waste: 'Waste (kg)',
  avgBrix: 'Avg Brix',
  brixReadings: 'Brix Readings',
  fruitCount: 'Fruit Count',
  totalFruitWeight: 'Total Fruit Weight',
  avgFruitWeight: 'Avg Fruit Weight',
  rowX: 'Row X',
  rowY: 'Row Y',
  photos: 'Photos',
  photoUrls: 'Photo URLs',
  tenantId: 'Tenant ID',
  createdAt: 'Created At',
  updatedAt: 'Updated At',
};
