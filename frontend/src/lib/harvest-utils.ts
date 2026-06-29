import { BatchStatus, InputMode } from '@/generated/graphql';
import type { Locale } from '@/i18n/config';
import type { Translations } from '@/i18n/translations';
import type {
  BatchDetailsData,
  HarvestEntryData,
} from '@/types/batch-sidebar.types';
import { createEmptyEntry } from '@/types/batch-sidebar.types';
import type {
  BatchLike,
  HarvestEntryLike,
  HarvestLike,
  HarvestSummary,
} from '@/types/harvest.types';

type HarvestTranslations = Translations['pages']['harvest'];

// Pick the right "harvest(s) logged" string for the count, using the locale's
// CLDR plural rules. Falls back to the plural form when the singular key is
// missing or PluralRules isn't available.
export function harvestsLoggedLabel(
  count: number,
  h: HarvestTranslations | undefined,
  locale: Locale,
): string {
  const fallbackPlural = h?.harvestsLogged ?? 'harvests logged';
  try {
    if (new Intl.PluralRules(locale).select(count) === 'one') {
      return h?.harvestLogged ?? 'harvest logged';
    }
  } catch {
    // Intl.PluralRules unavailable — fall through to plural form.
  }
  return fallbackPlural;
}

// Same as harvestsLoggedLabel for the "logged for" variant used on dashboards.
export function harvestsLoggedForLabel(
  count: number,
  h: HarvestTranslations | undefined,
  locale: Locale,
): string {
  const fallbackPlural = h?.harvestsLoggedFor ?? 'harvests logged for';
  try {
    if (new Intl.PluralRules(locale).select(count) === 'one') {
      return h?.harvestLoggedFor ?? 'harvest logged for';
    }
  } catch {
    // Intl.PluralRules unavailable — fall through to plural form.
  }
  return fallbackPlural;
}

export function computeAvgBrix(readings: number[]): number {
  const values = readings.filter((v) => v > 0);

  if (values.length === 0) return 0;

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
}

/**
 * Average weight of a single fruit in GRAMS, from a weighed sample:
 * sampleWeight (g) / sampleFruitCount. Returns 0 when the sample is incomplete
 * so it contributes nothing to the metric. Rounded to 3 decimals.
 */
export function computeAvgFruitWeight(
  sampleFruitCount: number,
  sampleWeight: number,
): number {
  if (sampleFruitCount <= 0 || sampleWeight <= 0) return 0;

  return Math.round((sampleWeight / sampleFruitCount) * 1000) / 1000;
}

// Quality-class label letter from a 0-based array index: 0 -> A, 1 -> B, ... The
// classes are positional and unbounded; the letter is derived, not from an enum.
// Mirrors the backend classLetter.
export function classLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

// Align the three per-class form arrays (weight kg, crate counts, remainders) to
// one common length (zero-filled), at least 1, so a single class index is valid
// across all of them regardless of which mode the entry was saved in.
export function normalizeEntryClasses(
  classKgs: number[] | null | undefined,
  counts: number[] | null | undefined,
  rems: number[] | null | undefined,
): { classKgs: number[]; crateCounts: number[]; remainingKgs: number[] } {
  const len = Math.max(
    1,
    classKgs?.length ?? 0,
    counts?.length ?? 0,
    rems?.length ?? 0,
  );
  return {
    classKgs: Array.from({ length: len }, (_, i) => classKgs?.[i] ?? 0),
    crateCounts: Array.from({ length: len }, (_, i) => counts?.[i] ?? 0),
    remainingKgs: Array.from({ length: len }, (_, i) => rems?.[i] ?? 0),
  };
}

// Derived sellable kg for one quality class in crate mode:
// crateCount × crateWeight + remainder. crateWeight is read live (never
// snapshotted), so editing it shifts every crate-mode entry's kg.
export function crateClassKg(
  count: number,
  remainder: number,
  crateWeight: number | null | undefined,
): number {
  return (count || 0) * (crateWeight ?? 0) + (remainder || 0);
}

// Total sellable kg for a crate-mode entry: the sum of the derived per-class kg
// across all classes present (dynamic count). Waste is tracked separately and
// never part of this total.
export function crateEntryTotalKg(
  crateCounts: number[] | null | undefined,
  remainingKgs: number[] | null | undefined,
  crateWeight: number | null | undefined,
): number {
  const len = Math.max(crateCounts?.length ?? 0, remainingKgs?.length ?? 0);
  let total = 0;
  for (let i = 0; i < len; i++) {
    total += crateClassKg(
      crateCounts?.[i] ?? 0,
      remainingKgs?.[i] ?? 0,
      crateWeight,
    );
  }
  return total;
}

export function extractStoragePathFromUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/,
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Format waste as a percentage of the total batch yield (sellable classes + waste).
 * Returns the percentage with one decimal place and a `%` suffix, e.g. "5.3%".
 * When the total yield is zero (no harvests logged or all values empty), returns
 * `—` so the cell doesn't read as "0.0%" — which would be misleading. The
 * underlying kg figures are kept untouched; this is purely a display helper for
 * the collapsed batch-summary row.
 */
export function formatWastePercent(
  wasteKg: number,
  classKgs: number[] | null | undefined,
): string {
  const sellable = (classKgs ?? []).reduce((sum, v) => sum + (v ?? 0), 0);
  const total = sellable + (wasteKg ?? 0);
  if (total <= 0) return '—';
  const pct = ((wasteKg ?? 0) / total) * 100;
  return `${pct.toFixed(1)}%`;
}

export function getGreenhouseLabel(greenhouse?: string | null): string {
  if (!greenhouse) return '-';
  if (greenhouse.includes('01') || greenhouse === 'gh1') return 'GH1';
  if (greenhouse.includes('02') || greenhouse === 'gh2') return 'GH2';
  return greenhouse;
}

export function formatHarvestDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

// Wall-clock time-of-day as HH:mm. The backend returns Postgres `time` as
// 'HH:mm:ss'; trim to HH:mm. Empty input -> '' so callers can fall back to '—'.
export function formatTimeOfDay(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

// Minutes since midnight from an 'HH:mm' / 'HH:mm:ss' string, or null if unset.
function timeOfDayToMinutes(value: string | null | undefined): number | null {
  const trimmed = formatTimeOfDay(value);
  if (!trimmed) return null;
  const [h, m] = trimmed.split(':');
  const minutes = Number(h) * 60 + Number(m);
  return Number.isFinite(minutes) ? minutes : null;
}

// Human "Xh Ym" duration between start and stop (same-day). Null unless both
// are present and stop is after start.
export function formatSessionDuration(
  startTime: string | null | undefined,
  stopTime: string | null | undefined,
): string | null {
  const start = timeOfDayToMinutes(startTime);
  const stop = timeOfDayToMinutes(stopTime);
  if (start == null || stop == null || stop <= start) return null;
  const total = stop - start;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Aggregate a set of harvests into the summary card figures, reading the
// service-computed `totals` and the parent batch name.
export function computeSummary(harvests: HarvestLike[]): HarvestSummary {
  if (harvests.length === 0) {
    return {
      totalHarvests: 0,
      variety: '-',
      totalClassA: 0,
      totalClassB: 0,
      totalClassC: 0,
      totalWaste: 0,
      avgBrix: 0,
    };
  }

  // classKgs is positional and dynamic (index 0=A, 1=B, 2=C, ...); the summary
  // cards still surface the first three classes.
  const totalClassA = harvests.reduce((s, h) => s + (h.totals.classKgs[0] ?? 0), 0);
  const totalClassB = harvests.reduce((s, h) => s + (h.totals.classKgs[1] ?? 0), 0);
  const totalClassC = harvests.reduce((s, h) => s + (h.totals.classKgs[2] ?? 0), 0);
  const totalWaste = harvests.reduce((s, h) => s + h.totals.waste, 0);
  const brixValues = harvests
    .map((h) => h.totals.avgBrix)
    .filter((v): v is number => v != null && v > 0);
  const avgBrix =
    brixValues.length > 0
      ? brixValues.reduce((s, v) => s + v, 0) / brixValues.length
      : 0;

  const counts: Record<string, number> = {};
  for (const h of harvests) {
    const name = h.batch?.name ?? '-';
    counts[name] = (counts[name] ?? 0) + 1;
  }
  const variety =
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '-';

  return {
    totalHarvests: harvests.length,
    variety,
    totalClassA: Math.round(totalClassA * 10) / 10,
    totalClassB: Math.round(totalClassB * 10) / 10,
    totalClassC: Math.round(totalClassC * 10) / 10,
    totalWaste: Math.round(totalWaste * 10) / 10,
    avgBrix: Math.round(avgBrix * 10) / 10,
  };
}

// Map one stored entry to the editable form shape. The normalized
// {class,value} brix objects are split back into the form's index-aligned
// readings / classes arrays.
function entryLikeToEntryData(entry: HarvestEntryLike): HarvestEntryData {
  const readings =
    entry.brixReadings.length > 0
      ? entry.brixReadings.map((b) => b.value)
      : [0];
  const classes =
    entry.brixReadings.length > 0
      ? entry.brixReadings.map((b) => b.class)
      : createEmptyEntry().brixClasses;
  // Align the three per-class arrays to one length (>=1) so the form's class
  // rows are consistent whichever mode the entry was saved in.
  const cls = normalizeEntryClasses(
    entry.classKgs,
    entry.crateCounts,
    entry.remainingKgs,
  );
  return {
    classKgs: cls.classKgs,
    crateCounts: cls.crateCounts,
    remainingKgs: cls.remainingKgs,
    waste: entry.waste,
    rowX: entry.rowX,
    rowY: entry.rowY,
    brixReadings: readings,
    brixClasses: classes,
    showBrix: entry.brixReadings.some((b) => b.value > 0),
    sampleWeight: entry.sampleWeight ?? 0,
    sampleFruitCount: entry.sampleFruitCount ?? 0,
    showFruitWeight:
      (entry.sampleWeight ?? 0) > 0 || (entry.sampleFruitCount ?? 0) > 0,
  };
}

// Editable entries for a harvest. A harvest with no entries yet starts with one
// blank entry so the sidebar always has a card to fill in.
export function harvestToEntries(h: HarvestLike): HarvestEntryData[] {
  if (h.entries && h.entries.length > 0) {
    return h.entries.map(entryLikeToEntryData);
  }
  return [createEmptyEntry()];
}

// Per-entry breakdown for the read-only detail view.
export function harvestToDisplayEntries(h: HarvestLike): HarvestEntryLike[] {
  return h.entries ?? [];
}

// A batch defines a usable row range only when both bounds are present and
// positive. A null/0 bound means the range hasn't been backfilled yet, in which
// case harvest row entry falls back to unconstrained behavior.
export function hasRowRange(
  start: number | null | undefined,
  end: number | null | undefined,
): boolean {
  return start != null && end != null && start > 0 && end > 0;
}

// True when a row value falls outside the batch's defined range. Returns false
// (no constraint) when the batch has no range, or when the row value is unset
// (<= 0) — we never flag an empty input. Used to limit inputs and to warn,
// without blocking, on legacy rows that predate the range (warn-but-allow).
export function isRowOutsideBatchRange(
  value: number,
  start: number | null | undefined,
  end: number | null | undefined,
): boolean {
  if (!hasRowRange(start, end)) return false;
  if (value <= 0) return false;
  return value < (start as number) || value > (end as number);
}

function daysSince(plantingDate: string): number {
  const planted = new Date(plantingDate);
  if (Number.isNaN(planted.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - planted.getTime()) / 86_400_000));
}

// Build the sidebar's batch-details view-model from a batch's planting fields.
function batchToDetails(
  batch: BatchLike,
  entries: HarvestEntryData[],
  photos: string[],
): BatchDetailsData {
  return {
    id: batch.id,
    name:
      batch.name ??
      [batch.crop?.name, batch.variety?.name].filter(Boolean).join(' - '),
    species: batch.crop?.name ?? '',
    variety: batch.variety?.name ?? '',
    status: batch.status ?? BatchStatus.Active,
    greenhouse: {
      id: batch.greenhouseId ?? batch.greenhouse?.id ?? '',
      name: batch.greenhouse?.name ?? '-',
    },
    daysAfterPlanting: daysSince(batch.plantingDate),
    area: batch.cultivationArea,
    numberOfRows: batch.numberOfRows,
    rowLength: batch.rowLength,
    plantsPerMeter: batch.plantsPerMeter,
    rowSpacing: batch.rowSpacing,
    startRow: batch.startRow ?? null,
    endRow: batch.endRow ?? null,
    totalPlants: batch.totalPlants,
    lostPlants: batch.lostPlants,
    replicates: replicateCount(batch),
    inputMode: batch.inputMode ?? InputMode.Weight,
    crateWeight: batch.crateWeight ?? null,
    plantingDate: batch.plantingDate,
    entries,
    photos,
  };
}

// A batch's replicate count, clamped to at least 1 so the form always renders
// at least one entry even for legacy/absent values.
function replicateCount(batch: BatchLike): number {
  return Math.max(1, batch.replicates ?? 1);
}

// Sidebar view-model for an existing harvest (its batch + its entries).
export function harvestToBatchDetails(h: HarvestLike): BatchDetailsData {
  const batch: BatchLike =
    h.batch ??
    ({
      id: h.batchId,
      name: '',
      status: BatchStatus.Active,
      plantingDate: h.date,
      cultivationArea: 0,
      numberOfRows: 0,
      rowLength: 0,
      plantsPerMeter: 0,
      rowSpacing: 0,
      totalPlants: 0,
      lostPlants: 0,
    } as BatchLike);
  return batchToDetails(batch, harvestToEntries(h), h.photoUrls ?? []);
}

// Sidebar view-model for a freshly created batch (no harvest yet): one blank
// entry per configured replicate, no photos.
export function batchToBatchDetails(batch: BatchLike): BatchDetailsData {
  const entries = Array.from({ length: replicateCount(batch) }, () =>
    createEmptyEntry(),
  );
  return batchToDetails(batch, entries, []);
}
