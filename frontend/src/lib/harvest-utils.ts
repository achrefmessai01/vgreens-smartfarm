import { BatchStatus } from '@/generated/graphql';
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
 * Average weight of a single fruit (kg) = total weight / fruit count.
 * Returns 0 when the count is missing so an incomplete entry contributes
 * nothing to the metric. Rounded to 3 decimals to preserve gram-level detail.
 */
export function computeAvgFruitWeight(
  fruitCount: number,
  totalFruitWeight: number,
): number {
  if (fruitCount <= 0 || totalFruitWeight <= 0) return 0;

  return Math.round((totalFruitWeight / fruitCount) * 1000) / 1000;
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

  const totalClassA = harvests.reduce((s, h) => s + h.totals.classA, 0);
  const totalClassB = harvests.reduce((s, h) => s + h.totals.classB, 0);
  const totalClassC = harvests.reduce((s, h) => s + h.totals.classC, 0);
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
  return {
    marketable: entry.classA,
    waste: entry.waste,
    classB: entry.classB,
    classC: entry.classC,
    rowX: entry.rowX,
    rowY: entry.rowY,
    brixReadings: readings,
    brixClasses: classes,
    showBrix: entry.brixReadings.some((b) => b.value > 0),
    fruitCount: entry.fruitCount,
    showFruitWeight: entry.fruitCount > 0,
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
    totalPlants: batch.totalPlants,
    lostPlants: batch.lostPlants,
    plantingDate: batch.plantingDate,
    entries,
    photos,
  };
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
// entry, no photos.
export function batchToBatchDetails(batch: BatchLike): BatchDetailsData {
  return batchToDetails(batch, [createEmptyEntry()], []);
}
