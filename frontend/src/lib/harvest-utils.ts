import { HarvestStatus } from '@/generated/graphql';
import type { Locale } from '@/i18n/config';
import type { Translations } from '@/i18n/translations';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import type { HarvestLike, HarvestSummary } from '@/types/harvest.types';

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

export function computeSummary(harvests: HarvestLike[]): HarvestSummary {
  if (harvests.length === 0) {
    return {
      totalHarvests: 0,
      variety: '-',
      totalClassA: 0,
      totalClassB: 0,
      totalWaste: 0,
      avgBrix: 0,
    };
  }

  const totalClassA = harvests.reduce((s, h) => s + h.classA, 0);
  const totalClassB = harvests.reduce((s, h) => s + h.classB, 0);
  const totalWaste = harvests.reduce((s, h) => s + h.waste, 0);
  const avgBrix = harvests.reduce((s, h) => s + h.avgBrix, 0) / harvests.length;

  const counts: Record<string, number> = {};
  for (const h of harvests) {
    counts[h.batch] = (counts[h.batch] ?? 0) + 1;
  }
  const variety =
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '-';

  return {
    totalHarvests: harvests.length,
    variety,
    totalClassA: Math.round(totalClassA * 10) / 10,
    totalClassB: Math.round(totalClassB * 10) / 10,
    totalWaste: Math.round(totalWaste * 10) / 10,
    avgBrix: Math.round(avgBrix * 10) / 10,
  };
}

export function harvestToBatchDetails(h: HarvestLike): BatchDetailsData {
  const plantingDate = new Date(h.plantingDate);
  const days = Math.max(
    0,
    Math.floor((Date.now() - plantingDate.getTime()) / 86_400_000),
  );

  return {
    id: h.id,
    name: h.batch,
    species: h.species,
    variety: h.variety,
    status: h.status ?? HarvestStatus.Draft,
    greenhouse: {
      id: h.greenhouse ?? '',
      name: getGreenhouseLabel(h.greenhouse),
    },
    daysAfterPlanting: days,
    area: h.cultivationArea,
    numberOfRows: h.numberOfRows,
    rowLength: h.rowLength,
    plantsPerMeter: h.plantsPerMeter,
    rowSpacing: h.rowSpacing,
    totalPlants: h.totalPlants,
    lostPlants: h.lostPlants,
    plantingDate: h.plantingDate,
    todaysHarvest: {
      marketable: h.classA,
      waste: h.waste,
      classB: h.classB,
      rowX: h.rowX,
      rowY: h.rowY,
    },
    brixReadings: h.brixReadings.length > 0 ? [...h.brixReadings] : [0],
    fruitCount: h.fruitCount,
    totalFruitWeight: h.totalFruitWeight,
    photos: h.photoUrls ?? [],
  };
}
