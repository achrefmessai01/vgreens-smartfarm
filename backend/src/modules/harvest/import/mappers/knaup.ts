// Knaup Erntemeldung importer
//
// Reads the "Erntemeldung" sheet from Knaup's XLS export files.
// One row = one harvest event. Columns we actually care about:
//
//   Parzellebez.           — parcel name like "ERD GWH vorne"
//                            first word = crop prefix (ERD → Strawberry)
//                            rest       = greenhouse label (GWH vorne)
//   Statistikstart         — harvest date in DD.MM.YYYY
//   Trvp Gew. [kg]         — Hkl I weight (class A), German decimal format
//   Trvp Gew. Qual.2 [kg]  — Hkl II/III weight (class B), optional
//   Parzellecode           — internal parcel code, used as fallback batch name suffix
//
//
// Batch name: Knaup's parcel labels ("GWH vorne") don't match what's in the DB
// ("Erdbeere - Lady Emma"). PARCEL_BATCH_MAP handles that translation manually.
// If a parcel isn't in the map the row is rejected — add it to PARCEL_BATCH_MAP first.
//
// Right now all Knaup data is Greenhouse 1 / Lady Emma — one batch, one greenhouse.

import * as XLSX from 'xlsx';
import type { ParsedRow, RowIssue } from '../types';
import { parseGermanDate, parseGermanNumber } from '../utils';

const REQUIRED_COLS = ['Parzellebez.', 'Statistikstart', 'Trvp Gew. [kg]'];
const SHEET_NAME = 'Erntemeldung';

// German prefix in Parzellebez. → English crop name in the DB.
const CROP_PREFIX_MAP: Record<string, string> = {
  ERD: 'Strawberry',  // Erdbeere
  TOM: 'Tomato',      // Tomate
  HIM: 'Raspberry',   // Himbeere
};


const PARCEL_BATCH_MAP: Record<string, { batchName: string; greenhouseName: string }> = {
  'GWH vorne':  { batchName: 'Erdbeere - Lady Emma', greenhouseName: 'Greenhouse 1' },
  'GWH hinten': { batchName: 'Strawberry - Karima Floris', greenhouseName: 'Greenhouse 2' },
};

interface ParsedParcel {
  cropNameHint: string;
  greenhouseNameHint: string;
  batchName: string;
}

// Strict parser — returns an error string if anything is unrecognised, result object if ok.
function parseParcelName(parcelName: string): ParsedParcel | string {
  const upper = parcelName.toUpperCase();
  for (const [prefix, crop] of Object.entries(CROP_PREFIX_MAP)) {
    if (upper.startsWith(prefix + ' ') || upper === prefix) {
      const ghPart = parcelName.slice(prefix.length).trim();
      const mapped = PARCEL_BATCH_MAP[ghPart];
      if (!mapped) {
        return (
          `Parcel "${ghPart}" is not in PARCEL_BATCH_MAP — ` +
          `add an entry for it before importing this file`
        );
      }
      return { cropNameHint: crop, greenhouseNameHint: mapped.greenhouseName, batchName: mapped.batchName };
    }
  }
  return `Unrecognised crop prefix in "${parcelName}" — add the prefix to CROP_PREFIX_MAP`;
}

export interface KnaupParseResult {
  rows: ParsedRow[];
  issues: RowIssue[];
}

export function parseKnaupFile(filePath: string): KnaupParseResult {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const isCsv = ext === 'csv';

  // For CSV files SheetJS uses the filename as the sheet name — skip the
  // named-sheet check and just take the first (only) sheet.
  const wb = XLSX.readFile(filePath, { type: 'file', cellDates: false });

  let ws: XLSX.WorkSheet;
  if (isCsv) {
    ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) {
      throw new Error('CSV file appears to be empty.');
    }
  } else {
    if (!wb.SheetNames.includes(SHEET_NAME)) {
      throw new Error(
        `Sheet "${SHEET_NAME}" not found in file. Available sheets: ${wb.SheetNames.join(', ')}`,
      );
    }
    ws = wb.Sheets[SHEET_NAME];
  }
  // raw=false: let xlsx format cells as strings (preserves German number format)
  const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
    raw: false,
  });

  if (raw.length < 2) {
    throw new Error(
      `Sheet "${SHEET_NAME}" has fewer than 2 rows — no data rows found.`,
    );
  }

  const headers = (raw[0] ?? []).map((h) => String(h ?? '').trim());

  const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    throw new Error(
      `Knaup mapper: missing required columns: ${missing.join(', ')}. ` +
        `Found: ${headers.join(', ')}`,
    );
  }

  const col = (name: string): number => headers.indexOf(name);

  const rows: ParsedRow[] = [];
  const issues: RowIssue[] = [];

  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    const sourceRow = i + 1; // 1-based (row 1 = header)
    const warnings: string[] = [];

    if (!r || r.every((v) => v == null || String(v).trim() === '')) continue;

    const parcelName = String(r[col('Parzellebez.')] ?? '').trim();
    const dateRaw = String(r[col('Statistikstart')] ?? '').trim();
    const grade1Raw = r[col('Trvp Gew. [kg]')];
    const grade2ColIdx = col('Trvp Gew. Qual.2 [kg]');
    const grade2Raw = grade2ColIdx >= 0 ? r[grade2ColIdx] : null;
    const parcelCodeIdx = col('Parzellecode');
    const parcelCodeRaw =
      parcelCodeIdx >= 0 ? String(r[parcelCodeIdx] ?? '').trim() : '';
    // Normalise parcel code: strip trailing ".0" that Excel sometimes adds
    const parcelCode = parcelCodeRaw.replace(/\.0+$/, '') || undefined;

    if (!parcelName) {
      // Silently skip — these are summary/total rows at the bottom of the sheet
      // (e.g. "Gesamt") that have no plot name. Not a data error.
      continue;
    }

    const harvestDate = parseGermanDate(dateRaw);
    if (!harvestDate) {
      issues.push({
        sourceRow,
        level: 'error',
        reason: `Cannot parse date "${dateRaw}" — expected DD.MM.YYYY`,
      });
      continue;
    }

    const grade1Kg = parseGermanNumber(grade1Raw);
    if (grade1Kg == null) {
      issues.push({
        sourceRow,
        level: 'error',
        reason: `Cannot parse "Trvp Gew. [kg]" = "${grade1Raw}"`,
      });
      continue;
    }

    const classKgs: number[] = [grade1Kg];

    if (grade2Raw != null && String(grade2Raw).trim() !== '') {
      const grade2Kg = parseGermanNumber(grade2Raw);
      if (grade2Kg == null) {
        warnings.push(
          `Cannot parse "Trvp Gew. Qual.2 [kg]" = "${grade2Raw}", skipping class B`,
        );
      } else if (grade2Kg > 0) {
        classKgs.push(grade2Kg);
      }
    }

    const parsed = parseParcelName(parcelName);
    if (typeof parsed === 'string') {
      issues.push({ sourceRow, level: 'error', reason: parsed });
      continue;
    }

    const { cropNameHint, greenhouseNameHint, batchName } = parsed;
    const batchKey = batchName;

    rows.push({
      harvestDate,
      batchKey,
      batchName,
      cropNameHint,
      greenhouseNameHint: greenhouseNameHint || undefined,
      externalCode: parcelCode,
      totalPlantsHint: undefined,  // Knaup files don't supply plant count
      classKgs,
      waste: 0,
      rowX: [],
      rowY: [],
      rowRef: undefined,
      sourceRow,
      warnings,
    });
  }

  return { rows, issues };
}
