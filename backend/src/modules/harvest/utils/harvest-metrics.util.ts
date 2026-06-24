import { roundTo, sum, sumByIndex, weightedMean } from '@common/utils';
import type { Batch } from '@modules/batch/entities/batch.entity';
import type { Harvest } from '../entities/harvest.entity';
import type { HarvestTotals } from '../dto/harvest-totals.dto';
import type {
  HarvestDashboardMetrics,
  YieldOverTimeData,
  YieldPerMeterData,
  YieldPerRunningMeterData,
  ClassDistributionData,
  BrixTrendData,
  FruitWeightTrendData,
  CumulativeYieldData,
} from '../dto/dashboard-metrics.dto';

// A harvest paired with its derived totals — the unit every dashboard
// aggregation works over.
export interface HarvestWithTotals {
  harvest: Harvest;
  totals: HarvestTotals;
}

const DAY_MS = 1000 * 60 * 60 * 24;

// ── grouping helpers ───────────────────────────────────────────────────────

const dayKey = (date: Date): string =>
  new Date(date).toISOString().split('T')[0];

// Items bucketed by harvest day, chronologically. The shared backbone of every
// trend so they all group dates identically.
function byDay(items: HarvestWithTotals[]): [string, HarvestWithTotals[]][] {
  const map = new Map<string, HarvestWithTotals[]>();
  for (const item of items) {
    const key = dayKey(item.harvest.date);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// Sellable weight of a harvest (all classes, waste removed). totalFruitWeight
// includes waste, so the sellable portion is the remainder.
const sellable = (t: HarvestTotals): number => t.totalFruitWeight - t.waste;

// ── weighted aggregations ──────────────────────────────────────────────────

// Σ totalFruitWeight / Σ denominator, with the denominator counted ONCE per
// batch (a batch harvested twice must not double its plant count / length).
// Null when no in-scope batch has a positive denominator.
function ratioByBatch(
  items: HarvestWithTotals[],
  denomOf: (batch: Batch) => number,
): number | null {
  const weightByBatch = new Map<string, number>();
  const denomByBatch = new Map<string, number>();
  for (const { harvest, totals } of items) {
    const id = harvest.batchId;
    weightByBatch.set(
      id,
      (weightByBatch.get(id) ?? 0) + totals.totalFruitWeight,
    );
    if (harvest.batch) denomByBatch.set(id, denomOf(harvest.batch));
  }
  let weight = 0;
  let denom = 0;
  for (const [id, w] of weightByBatch) {
    const d = denomByBatch.get(id) ?? 0;
    if (d > 0) {
      weight += w;
      denom += d;
    }
  }
  return denom > 0 ? roundTo(weight / denom, 3) : null;
}

// Sample-weighted mean of a per-harvest average (weighted by fruitCount), over
// the harvests whose value is present and positive. 0 when none qualify.
function sampleWeightedAverage(
  items: HarvestWithTotals[],
  valueOf: (t: HarvestTotals) => number | null,
): number {
  const usable = items.filter((i) => (valueOf(i.totals) ?? 0) > 0);
  return weightedMean(
    usable.map((i) => valueOf(i.totals) ?? 0),
    usable.map((i) => i.totals.fruitCount),
  );
}

// ── trends ─────────────────────────────────────────────────────────────────

function yieldOverTime(items: HarvestWithTotals[]): YieldOverTimeData[] {
  return byDay(items).map(([date, day]) => ({
    date,
    yield: roundTo(sum(day.map((i) => sellable(i.totals))), 1),
  }));
}

// Per-day weighted yield over a per-batch length denominator (row length or
// running meters), each batch's length counted once per day. Days with no
// positive length are dropped.
function lengthTrend(
  items: HarvestWithTotals[],
  lengthOf: (batch: Batch) => number,
): { date: string; ratio: number }[] {
  return byDay(items)
    .map(([date, day]) => ({ date, ratio: ratioByBatch(day, lengthOf) }))
    .filter((p): p is { date: string; ratio: number } => p.ratio !== null);
}

function yieldPerMeterTrend(items: HarvestWithTotals[]): YieldPerMeterData[] {
  return lengthTrend(items, (b) => b.rowLength ?? 0).map(({ date, ratio }) => ({
    date,
    yieldPerMeter: ratio,
  }));
}

function yieldPerRunningMeterTrend(
  items: HarvestWithTotals[],
): YieldPerRunningMeterData[] {
  return lengthTrend(items, (b) => b.runningMeter ?? 0).map(
    ({ date, ratio }) => ({ date, yieldPerRunningMeter: ratio }),
  );
}

// Per-day sample-weighted mean of a per-harvest average. Days with no qualifying
// reading are dropped.
function dailyWeightedMean(
  items: HarvestWithTotals[],
  valueOf: (t: HarvestTotals) => number | null,
  decimals: number,
): { date: string; value: number }[] {
  return byDay(items)
    .map(([date, day]) => ({
      date,
      day: day.filter((i) => (valueOf(i.totals) ?? 0) > 0),
    }))
    .filter(({ day }) => day.length > 0)
    .map(({ date, day }) => ({
      date,
      value: roundTo(sampleWeightedAverage(day, valueOf), decimals),
    }));
}

function brixTrend(items: HarvestWithTotals[]): BrixTrendData[] {
  return dailyWeightedMean(items, (t) => t.avgBrix, 1).map(
    ({ date, value }) => ({ date, brix: value }),
  );
}

function fruitWeightTrend(items: HarvestWithTotals[]): FruitWeightTrendData[] {
  return dailyWeightedMean(items, (t) => t.avgFruitWeight, 3).map(
    ({ date, value }) => ({ date, weight: value }),
  );
}

// Per-day per-class kg (index 0=A, 1=B, ...), padded to the widest day so every
// datum has the same length for the stacked chart.
function classDistribution(
  items: HarvestWithTotals[],
): ClassDistributionData[] {
  const days = byDay(items).map(([date, day]) => {
    const classes: number[] = [];
    let waste = 0;
    for (const { totals } of day) {
      (totals.classKgs ?? []).forEach((kg, i) => {
        classes[i] = (classes[i] ?? 0) + (kg ?? 0);
      });
      waste += totals.waste;
    }
    return { date, classes, waste };
  });
  const maxLen = Math.max(0, ...days.map((d) => d.classes.length));
  return days.map((d) => ({
    date: d.date,
    classes: Array.from({ length: maxLen }, (_, i) =>
      roundTo(d.classes[i] ?? 0, 1),
    ),
    waste: roundTo(d.waste, 1),
  }));
}

// Cumulative sellable (all classes) and waste over time.
function cumulativeYield(items: HarvestWithTotals[]): CumulativeYieldData[] {
  let runningSellable = 0;
  let runningWaste = 0;
  return byDay(items).map(([date, day]) => {
    for (const { totals } of day) {
      runningSellable += sellable(totals);
      runningWaste += totals.waste;
    }
    return {
      date,
      cumulativeSellable: roundTo(runningSellable, 1),
      cumulativeWaste: roundTo(runningWaste, 1),
    };
  });
}

// ── scalar aggregations ────────────────────────────────────────────────────

// Most common name across the harvests for a given selector (species/variety).
function topName(
  items: HarvestWithTotals[],
  selectName: (i: HarvestWithTotals) => string | null | undefined,
): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = selectName(item) ?? 'N/A';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
}

// Span from the earliest batch planting (or earliest harvest if none) to the
// latest harvest, in whole days.
function daysActive(items: HarvestWithTotals[]): number {
  const harvestTimes = items.map((i) => new Date(i.harvest.date).getTime());
  const plantingTimes = items
    .map((i) => i.harvest.batch?.plantingDate)
    .filter((d): d is Date => d != null)
    .map((d) => new Date(d).getTime());
  const earliest =
    plantingTimes.length > 0
      ? Math.min(...plantingTimes)
      : Math.min(...harvestTimes);
  const latest = Math.max(...harvestTimes);
  return Math.max(0, Math.ceil((latest - earliest) / DAY_MS));
}

// A harvest is "critical" when its mean brix is low or its waste share is high.
function countCriticalAlerts(items: HarvestWithTotals[]): number {
  return items.filter(({ totals }) => {
    const picked = totals.totalFruitWeight; // all classes + waste
    const lowBrix = totals.avgBrix !== null && totals.avgBrix < 6.0;
    const highWaste = picked > 0 && totals.waste / picked > 0.15;
    return lowBrix || highWaste;
  }).length;
}

// Build the full dashboard payload from harvests already paired with totals.
// Pure — the caller is responsible for the query and for the empty case.
export function buildDashboardMetrics(
  items: HarvestWithTotals[],
): HarvestDashboardMetrics {
  const totalWaste = sum(items.map((i) => i.totals.waste));
  // totalFruitWeight already includes waste, so it IS the total yield; sellable
  // is the remainder (all quality classes, not just A/B/C).
  const totalYield = sum(items.map((i) => i.totals.totalFruitWeight));
  const totalSellable = totalYield - totalWaste;

  return {
    species: topName(items, (i) => i.harvest.batch?.crop?.name),
    variety: topName(items, (i) => i.harvest.batch?.variety?.name),
    harvestCount: items.length,
    totalYield: roundTo(totalYield, 1),
    averageBrix: roundTo(
      sampleWeightedAverage(items, (t) => t.avgBrix),
      1,
    ),
    averageFruitWeight: roundTo(
      sampleWeightedAverage(items, (t) => t.avgFruitWeight),
      3,
    ),
    yieldPerPlant: ratioByBatch(items, (b) => b.livingPlants),
    yieldPerMeter: ratioByBatch(items, (b) => b.rowLength ?? 0),
    yieldPerRunningMeter: ratioByBatch(items, (b) => b.runningMeter ?? 0),
    marketablePercent: roundTo(
      totalYield > 0 ? (totalSellable / totalYield) * 100 : 0,
      1,
    ),
    wastePercent: roundTo(
      totalYield > 0 ? (totalWaste / totalYield) * 100 : 0,
      1,
    ),
    wasteTotal: roundTo(totalWaste, 1),
    classTotals: sumByIndex(items.map((i) => i.totals.classKgs ?? [])).map(
      (kg) => roundTo(kg, 1),
    ),
    criticalAlerts: countCriticalAlerts(items),
    daysActive: daysActive(items),
    yieldOverTime: yieldOverTime(items),
    yieldPerMeterTrend: yieldPerMeterTrend(items),
    yieldPerRunningMeterTrend: yieldPerRunningMeterTrend(items),
    classDistribution: classDistribution(items),
    brixTrend: brixTrend(items),
    fruitWeightTrend: fruitWeightTrend(items),
    cumulativeYield: cumulativeYield(items),
  };
}

// Zero-value payload for an empty scope (no harvests match the filter).
export function emptyDashboardMetrics(): HarvestDashboardMetrics {
  return {
    species: 'N/A',
    variety: 'N/A',
    harvestCount: 0,
    totalYield: 0,
    averageBrix: 0,
    averageFruitWeight: 0,
    yieldPerPlant: null,
    yieldPerMeter: null,
    yieldPerRunningMeter: null,
    marketablePercent: 0,
    wastePercent: 0,
    wasteTotal: 0,
    classTotals: [],
    criticalAlerts: 0,
    daysActive: 0,
    yieldOverTime: [],
    yieldPerMeterTrend: [],
    yieldPerRunningMeterTrend: [],
    classDistribution: [],
    brixTrend: [],
    fruitWeightTrend: [],
    cumulativeYield: [],
  };
}
