import type { HarvestSummary } from '@/types/harvest';

export interface HarvestLike {
  id: string;
  batch: string;
  species: string;
  variety: string;
  plantingDate: string;
  cultivationArea: number;
  classA: number;
  waste: number;
  avgBrix: number;
}

export function getGreenhouseLabel(greenhouse?: string | null): string {
  if (!greenhouse) return '—';
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
      variety: '—',
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
    Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—';
  return {
    totalHarvests: harvests.length,
    variety,
    totalClassA: Math.round(totalClassA * 10) / 10,
    totalWaste: Math.round(totalWaste * 10) / 10,
    avgBrix: Math.round(avgBrix * 10) / 10,
  };
}
