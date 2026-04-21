import { HarvestStatus } from '@/generated/graphql';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import type { HarvestLike, HarvestSummary } from '@/types/harvest.types';

export function computeAvgBrix(
  brix: BatchDetailsData['brixMeasurements'],
): number {
  const values = [
    brix.brix1,
    brix.brix2,
    brix.brix3,
    brix.brix4,
    brix.brix5,
    brix.brix6,
    brix.brix7,
    brix.brix8,
    brix.brix9,
    brix.brix10,
  ].filter((v) => v > 0);

  if (values.length === 0) return 0;

  return (
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
    ) / 10
  );
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
      totalWaste: 0,
      avgBrix: 0,
    };
  }

  const totalClassA = harvests.reduce((s, h) => s + h.classA, 0);
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
    plantingDate: h.plantingDate,
    todaysHarvest: {
      marketable: h.classA,
      waste: h.waste,
      numberOfRowsHarvested: h.numberOfRowsHarvested,
    },
    brixMeasurements: {
      brix1: h.brix1,
      brix2: h.brix2,
      brix3: h.brix3,
      brix4: h.brix4,
      brix5: h.brix5,
      brix6: h.brix6,
      brix7: h.brix7,
      brix8: h.brix8,
      brix9: h.brix9,
      brix10: h.brix10,
    },
    photos: h.photoUrls ?? [],
  };
}
