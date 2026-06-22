'use client';

import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import type { HarvestBatchListItem } from '@/lib/hooks/use-harvest-batches';
import {
  useHarvestDashboard,
  type DateFilter,
  type HarvestDashboardData,
} from '@/lib/hooks/use-harvest-dashboard';
import { GitCompareArrows } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrixTrendChart } from './charts/brix-trend-chart';
import { ClassDistributionChart } from './charts/class-distribution-chart';
import { CumulativeYieldChart } from './charts/cumulative-yield-chart';
import { FruitWeightTrendChart } from './charts/fruit-weight-trend-chart';
import { YieldOverTimeChart } from './charts/yield-over-time-chart';
import { YieldPerMeterChart } from './charts/yield-per-meter-chart';

const COMPARE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface HarvestDashboardCompareProps {
  batches: HarvestBatchListItem[];
  compareBatchIds: string[];
  period: DateFilter;
}

interface LoadedBatch {
  batch: HarvestBatchListItem;
  color: string;
  data: HarvestDashboardData | undefined;
  loading: boolean;
}

interface BatchLoaderProps {
  batch: HarvestBatchListItem;
  color: string;
  period: DateFilter;
  onLoaded: (state: LoadedBatch) => void;
}

function BatchDataLoader({ batch, color, period, onLoaded }: BatchLoaderProps) {
  const { data, loading } = useHarvestDashboard({
    dateFilter: period,
    batchId: batch.id,
  });

  useEffect(() => {
    onLoaded({ batch, color, data, loading });
  }, [batch, color, data, loading, onLoaded]);

  return null;
}

export function HarvestDashboardCompare({
  batches,
  compareBatchIds,
  period,
}: HarvestDashboardCompareProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const selected = compareBatchIds
    .map((id, idx) => {
      const batch = batches.find((b) => b.id === id);
      return batch
        ? { batch, color: COMPARE_COLORS[idx % COMPARE_COLORS.length] }
        : null;
    })
    .filter((x): x is { batch: HarvestBatchListItem; color: string } => !!x);

  const [loaded, setLoaded] = useState<Record<string, LoadedBatch>>({});

  if (selected.length < 2) {
    return (
      <Card className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <GitCompareArrows className="text-muted-foreground mb-3 h-8 w-8" />
        <p className="text-foreground text-sm font-medium">
          {h?.selectAtLeast2 ?? 'Select at least 2 batches to compare'}
        </p>
        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
          {h?.useDropdownHint ??
            'Use the dropdown above to pick up to 4 batches and compare their yield and quality side by side.'}
        </p>
      </Card>
    );
  }

  const yieldSeries = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.yieldOverTime ?? [],
  }));

  const yieldPerMeterSeries = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.yieldPerMeterTrend ?? [],
  }));

  const brixSeries = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.brixTrend ?? [],
  }));

  const fruitWeightSeries = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.fruitWeightTrend ?? [],
  }));

  const cumulativeSeries = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.cumulativeYield ?? [],
  }));

  const classSeries = selected.map(({ batch, color }) => {
    const data = loaded[batch.id]?.data;
    const totalYield = data?.totalYield ?? 0;
    const wasteTotal = data?.wasteTotal ?? 0;
    const classBTotal = data?.classBTotal ?? 0;
    const classCTotal = data?.classCTotal ?? 0;
    // "marketable" is the Quality A bar only; B and C stack on top of it, so
    // back them out of the sellable total to avoid double-counting. The compare
    // view summarizes batches by the first three classes (A/B/C) — the per-class
    // array the chart expects, index 0=A, 1=B, 2=C.
    const marketable = Math.max(
      totalYield - wasteTotal - classBTotal - classCTotal,
      0,
    );
    return {
      batchId: batch.id,
      batchName: batch.name,
      color,
      classes: [marketable, classBTotal, classCTotal],
      waste: wasteTotal,
    };
  });

  return (
    <div>
      {selected.map(({ batch, color }) => (
        <BatchDataLoader
          key={batch.id}
          batch={batch}
          color={color}
          period={period}
          onLoaded={(state) =>
            setLoaded((prev) =>
              prev[state.batch.id] &&
              prev[state.batch.id].loading === state.loading &&
              prev[state.batch.id].data === state.data
                ? prev
                : { ...prev, [state.batch.id]: state },
            )
          }
        />
      ))}

      <div
        className={`mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 ${
          selected.length === 2
            ? 'md:grid-cols-2'
            : selected.length === 3
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {selected.map(({ batch, color }) => {
          const state = loaded[batch.id];
          const data = state?.data;
          const isLoading = state?.loading ?? true;
          const totalYield = data?.totalYield ?? 0;
          const marketablePercent = data?.marketablePercent ?? 0;
          const wastePercent = data?.wastePercent ?? 0;
          const averageBrix = data?.averageBrix ?? 0;
          const averageFruitWeight = data?.averageFruitWeight ?? 0;
          const yieldPerPlant = data?.yieldPerPlant ?? null;
          const criticalAlerts = data?.criticalAlerts ?? 0;
          const daysActive = data?.daysActive ?? 0;
          const harvestCount = data?.harvestCount ?? 0;
          return (
            <Card
              key={batch.id}
              className="border-l-4 p-4"
              style={{ borderLeftColor: color }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{batch.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {batch.species} · {batch.variety}
                  </p>
                </div>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <p className="text-muted-foreground">
                    {h?.totalYield ?? 'Total Yield'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading ? '–' : `${totalYield.toFixed(1)} kg`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.averageBrix ?? 'Avg Brix'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading ? '–' : `${averageBrix.toFixed(1)}°Bx`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.averageFruitWeight ?? 'Avg Fruit Weight'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading ? '–' : `${averageFruitWeight.toFixed(3)} kg`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.yieldPerPlantShort ?? 'Yield/Plant'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading
                      ? '–'
                      : yieldPerPlant == null
                        ? '—'
                        : `${yieldPerPlant.toFixed(2)} kg`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.marketablePercent ?? 'Marketable %'}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {isLoading ? '–' : `${marketablePercent.toFixed(1)}%`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.wastePercent ?? 'Waste %'}
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    {isLoading ? '–' : `${wastePercent.toFixed(1)}%`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.criticalAlerts ?? 'Critical Alerts'}
                  </p>
                  <p className="text-sm font-semibold text-amber-600">
                    {isLoading ? '–' : criticalAlerts}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {h?.daysActive ?? 'Days Active'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading ? '–' : daysActive}
                  </p>
                </div>
              </div>
              {!isLoading && harvestCount === 0 && (
                <p className="text-muted-foreground mt-3 text-xs italic">
                  {h?.noHarvestsInPeriod ?? 'No harvests in this period'}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <YieldOverTimeChart series={yieldSeries} />
        <YieldPerMeterChart series={yieldPerMeterSeries} />
        <ClassDistributionChart series={classSeries} />
        <BrixTrendChart series={brixSeries} />
        <FruitWeightTrendChart series={fruitWeightSeries} />
        <CumulativeYieldChart series={cumulativeSeries} />
      </div>
    </div>
  );
}
