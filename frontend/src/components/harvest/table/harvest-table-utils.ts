'use client';

import { type HarvestsQuery, type BatchesQuery } from '@/generated/graphql';

export type HarvestItem = HarvestsQuery['harvests'][number];
export type BatchItem = BatchesQuery['batches'][number];

export type BatchGroup = {
  key: string;
  batch: BatchItem;
  entries: HarvestItem[];
};

// Cumulative totals for a collapsed batch — the sum/mean of its harvest
// entries' (already service-computed) totals. Mirrors the backend aggregation
// (see HarvestService): class figures + weights/counts SUM; Brix and avg fruit
// weight are the UNWEIGHTED mean of the per-entry values (ignoring null/0);
// the two yields recompute from the summed weight over the batch's
// plants / running metres.
export interface AggregatedBatchTotals {
  // Per-quality kg sums, positional and dynamic (index 0=A, 1=B, ...), as wide as
  // the widest entry in the group.
  classKgs: number[];
  waste: number;
  fruitCount: number;
  totalFruitWeight: number;
  avgBrix: number | null;
  avgFruitWeight: number | null;
  yieldPerPlant: number | null;
  yieldPerRunningMeter: number | null;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function aggregateBatchTotals(
  entries: HarvestItem[],
  batch: BatchItem,
): AggregatedBatchTotals {
  const classKgs: number[] = [];
  let waste = 0;
  let fruitCount = 0;
  let totalFruitWeight = 0;
  const brixValues: number[] = [];
  const fruitWeightValues: number[] = [];

  for (const { totals } of entries) {
    const kgs = totals.classKgs ?? [];
    for (let i = 0; i < kgs.length; i++) {
      classKgs[i] = (classKgs[i] ?? 0) + (kgs[i] ?? 0);
    }
    waste += totals.waste;
    fruitCount += totals.fruitCount;
    totalFruitWeight += totals.totalFruitWeight;
    if (totals.avgBrix != null && totals.avgBrix > 0) {
      brixValues.push(totals.avgBrix);
    }
    if (totals.avgFruitWeight != null && totals.avgFruitWeight > 0) {
      fruitWeightValues.push(totals.avgFruitWeight);
    }
  }

  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const avgBrix = brixValues.length > 0 ? roundTo(mean(brixValues), 1) : null;
  const avgFruitWeight =
    fruitWeightValues.length > 0 ? roundTo(mean(fruitWeightValues), 3) : null;

  const totalPlants = batch?.totalPlants ?? 0;
  const runningMeter = batch?.runningMeter ?? 0;
  const yieldPerPlant =
    totalPlants > 0 ? roundTo(totalFruitWeight / totalPlants, 3) : null;
  const yieldPerRunningMeter =
    runningMeter > 0 ? roundTo(totalFruitWeight / runningMeter, 3) : null;

  return {
    classKgs: classKgs.map((v) => roundTo(v ?? 0, 3)),
    waste,
    fruitCount,
    totalFruitWeight,
    avgBrix,
    avgFruitWeight,
    yieldPerPlant,
    yieldPerRunningMeter,
  };
}

export function getCreatedByLabel(harvest: HarvestItem) {
  if (!harvest.createdBy) return '-';
  const fullName = [harvest.createdBy.firstName, harvest.createdBy.lastName]
    .filter(Boolean)
    .join(' ');
  return fullName || harvest.createdBy.email || '-';
}

// Build one group per batch, attaching that batch's harvest events. Batches
// with no harvests yet are still returned (with an empty entries list) so they
// remain visible in the harvest-entry tab.
//
// Group order is intentionally NOT re-sorted here: the `batches` array already
// arrives in the server-applied sort order (see the Batches query's `sort`
// variable), so we preserve it to stay correct under pagination. Only the
// harvest entries *within* a group are ordered (most recent first).
export function groupByBatch(
  batches: BatchItem[],
  harvests: HarvestItem[],
): BatchGroup[] {
  const entriesByBatch = new Map<string, HarvestItem[]>();
  for (const h of harvests) {
    const list = entriesByBatch.get(h.batchId) ?? [];
    list.push(h);
    entriesByBatch.set(h.batchId, list);
  }

  return batches.map((batch) => ({
    key: batch.id,
    batch,
    entries: [...(entriesByBatch.get(batch.id) ?? [])].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    ),
  }));
}
