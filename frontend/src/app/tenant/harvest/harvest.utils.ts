import type { BatchDetailsData } from '@/components/harvest/batch-sidebar/batch-sidebar-types';
import { HarvestStatus } from '@/generated/graphql';

export interface HarvestSummary {
  totalHarvests: number;
  variety: string;
  totalClassA: number;
  totalWaste: number;
  avgBrix: number;
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

interface HarvestLike {
  id: string;
  batch: string;
  species: string;
  variety: string;
  status: HarvestStatus;
  greenhouse?: string | null;
  plantingDate: string;
  cultivationArea: number;
  classA: number;
  waste: number;
  avgBrix: number;
  brix1: number;
  brix2: number;
  brix3: number;
  brix4: number;
  brix5: number;
  brix6: number;
  brix7: number;
  brix8: number;
  brix9: number;
  brix10: number;
  photoUrls?: string[] | null;
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
    plantingDate: h.plantingDate,
    todaysHarvest: { marketable: h.classA, waste: h.waste },
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
