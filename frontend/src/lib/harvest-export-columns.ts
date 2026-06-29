// Column keys in canonical CSV order. MUST stay in sync with COLUMN_DEFS in the
// backend csv.util.ts. `rowType` is intentionally excluded from the export.
export const EXPORT_COLUMN_KEYS = [
  'id',
  'batchId',
  'batch',
  'batchNumber',
  'species',
  'variety',
  'status',
  'greenhouse',
  'plantingDate',
  'harvestDate',
  'startTime',
  'stopTime',
  'harvesterHeadCount',
  'cultivationArea',
  'numberOfRows',
  'rowLength',
  'runningMeter',
  'rowSpacing',
  'plantsPerMeter',
  'totalPlants',
  'lostPlants',
  'classA',
  'classB',
  'classC',
  'waste',
  'avgBrix',
  'brixReadings',
  'fruitCount',
  'totalFruitWeight',
  'avgFruitWeight',
  'yieldPerPlant',
  'yieldPerRunningMeter',
  'photoUrls',
  'tenantId',
  'createdById',
  'createdAt',
  'updatedAt',
] as const;

export type ExportColumnKey = (typeof EXPORT_COLUMN_KEYS)[number];

// Logical groupings for the export dialog's column picker, in display order.
// Every EXPORT_COLUMN_KEYS entry belongs to exactly one group (see the
// exhaustiveness check below). `labelKey` resolves against i18n
// exportColumnGroups[labelKey], falling back to defaultLabel.
export interface ExportColumnGroup {
  id: string;
  defaultLabel: string;
  keys: ExportColumnKey[];
}

export const EXPORT_COLUMN_GROUPS: readonly ExportColumnGroup[] = [
  {
    id: 'session',
    defaultLabel: 'Session',
    keys: ['harvestDate', 'startTime', 'stopTime', 'harvesterHeadCount'],
  },
  {
    id: 'cropBatch',
    defaultLabel: 'Crop & Batch',
    keys: [
      'batch',
      'batchNumber',
      'species',
      'variety',
      'status',
      'greenhouse',
      'plantingDate',
    ],
  },
  {
    id: 'yieldQuality',
    defaultLabel: 'Yield & Quality',
    keys: [
      'classA',
      'classB',
      'classC',
      'waste',
      'avgBrix',
      'brixReadings',
      'fruitCount',
      'totalFruitWeight',
      'avgFruitWeight',
      'yieldPerPlant',
      'yieldPerRunningMeter',
    ],
  },
  {
    id: 'plot',
    defaultLabel: 'Plot & Planting',
    keys: [
      'cultivationArea',
      'numberOfRows',
      'rowLength',
      'runningMeter',
      'rowSpacing',
      'plantsPerMeter',
      'totalPlants',
      'lostPlants',
    ],
  },
  {
    id: 'media',
    defaultLabel: 'Media',
    keys: ['photoUrls'],
  },
  {
    id: 'meta',
    defaultLabel: 'Identifiers & Metadata',
    keys: [
      'id',
      'batchId',
      'tenantId',
      'createdById',
      'createdAt',
      'updatedAt',
    ],
  },
] as const;

// Dev-time guard: the groups must cover every export column exactly once, so a
// newly added column can never silently vanish from the picker.
if (process.env.NODE_ENV !== 'production') {
  const grouped = EXPORT_COLUMN_GROUPS.flatMap((g) => g.keys);
  const missing = EXPORT_COLUMN_KEYS.filter((k) => !grouped.includes(k));
  const extra = grouped.filter((k) => !EXPORT_COLUMN_KEYS.includes(k));
  if (
    missing.length ||
    extra.length ||
    grouped.length !== new Set(grouped).size
  ) {
    console.error('EXPORT_COLUMN_GROUPS out of sync with EXPORT_COLUMN_KEYS', {
      missing,
      extra,
    });
  }
}

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
  batchId: 'Batch ID',
  batch: 'Batch',
  batchNumber: 'Batch Number',
  species: 'Crop',
  variety: 'Variety',
  status: 'Status',
  greenhouse: 'Greenhouse',
  plantingDate: 'Planting Date',
  harvestDate: 'Harvest Date',
  startTime: 'Start Time',
  stopTime: 'Stop Time',
  harvesterHeadCount: 'Harvesters',
  cultivationArea: 'Cultivation Area (m²)',
  numberOfRows: 'Number of Rows',
  rowLength: 'Row Length (m)',
  runningMeter: 'Running Meters (m)',
  rowSpacing: 'Row Spacing',
  plantsPerMeter: 'Plants per Meter',
  totalPlants: 'Total Plants',
  lostPlants: 'Lost Plants',
  classA: 'Class A (kg)',
  classB: 'Class B (kg)',
  classC: 'Class C (kg)',
  waste: 'Waste (kg)',
  avgBrix: 'Avg Brix',
  brixReadings: 'Brix Readings',
  fruitCount: 'Fruit Count',
  totalFruitWeight: 'Total Fruit Weight (kg)',
  avgFruitWeight: 'Avg Fruit Weight (g)',
  yieldPerPlant: 'Yield per Plant',
  yieldPerRunningMeter: 'Yield per Running Meter',
  photoUrls: 'Photo URLs',
  tenantId: 'Tenant ID',
  createdById: 'Created By ID',
  createdAt: 'Created At',
  updatedAt: 'Updated At',
};
