/**
 * Shared types for the harvest import pipeline.
 * VSL-178: tenant-aware harvest CSV/Excel import tool.
 */

/** One canonical harvest event parsed from a source file row. */
export interface ParsedRow {
  /** ISO date string YYYY-MM-DD */
  harvestDate: string;
  /**
   * Stable, unique key that groups rows belonging to the same batch.
   * e.g. "Eves Delight 2::001.2026 Haus 1_2 Erdbeeren" (Frutania)
   *      "ERD GWH vorne" (Knaup)
   */
  batchKey: string;
  /** Human-readable batch name to store/search in DB */
  batchName: string;
  /** Variety name hint (stripped of leading index number) */
  varietyNameHint?: string;
  /** Crop name hint (e.g. "Erdbeere") */
  cropNameHint?: string;
  /** Greenhouse name hint (e.g. "Haus 1_2") */
  greenhouseNameHint?: string;
  /** External reference code from source (e.g. Knaup Parzellecode) */
  externalCode?: string;
  /** Plant count hint for batch creation */
  totalPlantsHint?: number;
  /**
   * Weight per quality class in KG, positional (index 0 = class A, 1 = class B, ...).
   * Maps to HarvestEntry.classKgs in the vGreens schema.
   */
  classKgs: number[];
  /** Waste weight in kg */
  waste: number;
  /** Row segment start positions (parallel with rowY) */
  rowX?: number[];
  /** Row segment end positions (parallel with rowX) */
  rowY?: number[];
  /** Original row reference string from source (e.g. "1_1") */
  rowRef?: string;
  /** 1-based row number in source file/sheet (for error reporting) */
  sourceRow: number;
  /** Non-fatal parser warnings */
  warnings: string[];
}

export interface RowIssue {
  sourceRow: number;
  level: 'error' | 'warning';
  reason: string;
}

export interface ImportReport {
  tenant: string;
  tenantId: string;
  file: string;
  mapper: 'knaup' | 'frutania';
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  created: number;
  skippedDuplicates: number;
  failed: number;
  issues: RowIssue[];
  globalWarnings: string[];
}
