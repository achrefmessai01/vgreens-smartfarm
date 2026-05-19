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
import { YieldOverTimeChart } from './charts/yield-over-time-chart';

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

function BatchDataLoader({
  batch,
  color,
  period,
  onLoaded,
}: BatchLoaderProps) {
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
          Select at least 2 batches to compare
        </p>
        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
          Use the dropdown above to pick up to 4 batches and compare their yield
          and quality side by side.
        </p>
      </Card>
    );
  }

  const series = selected.map(({ batch, color }) => ({
    batchId: batch.id,
    batchName: batch.name,
    color,
    data: loaded[batch.id]?.data?.yieldOverTime ?? [],
  }));

  return (
    <div className="flex flex-col gap-6">
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
                : { ...prev, [state.batch.id]: state }
            )
          }
        />
      ))}

      <div
        className={`grid grid-cols-1 gap-3 sm:gap-4 ${
          selected.length === 2
            ? 'sm:grid-cols-2'
            : selected.length === 3
              ? 'sm:grid-cols-3'
              : 'sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {selected.map(({ batch, color }) => {
          const state = loaded[batch.id];
          const data = state?.data;
          const isLoading = state?.loading ?? true;
          const totalYield = data?.totalYield ?? 0;
          const marketablePercent = data?.marketablePercent ?? 0;
          const averageBrix = data?.averageBrix ?? 0;
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
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
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
                    {h?.marketablePercent ?? 'Marketable'}
                  </p>
                  <p className="text-sm font-semibold">
                    {isLoading ? '–' : `${marketablePercent.toFixed(1)}%`}
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
              </div>
              {!isLoading && harvestCount === 0 && (
                <p className="text-muted-foreground mt-3 text-xs italic">
                  No harvests in this period
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <YieldOverTimeChart
        title={`${h?.yieldOverTime ?? 'Yield Over Time'} — comparison`}
        series={series}
      />

      <div
        className={`grid grid-cols-1 gap-4 ${
          selected.length === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-2 xl:grid-cols-3'
        }`}
      >
        {selected.map(({ batch, color }) => {
          const state = loaded[batch.id];
          const data = state?.data;
          return (
            <div key={batch.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium">{batch.name}</span>
              </div>
              <BrixTrendChart data={data?.brixTrend ?? []} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
