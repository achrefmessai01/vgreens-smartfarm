'use client';

import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { useLocaleFormatters } from '@/i18n/use-locale-formatters';
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
import { YieldPerRunningMeterChart } from './charts/yield-per-running-meter-chart';

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

interface MetricRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function MetricRow({ label, value, valueClassName }: MetricRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <p className="text-muted-foreground truncate">{label}</p>
      <p className={`shrink-0 font-semibold ${valueClassName ?? ''}`}>
        {value}
      </p>
    </div>
  );
}

export function HarvestDashboardCompare({
  batches,
  compareBatchIds,
  period,
}: HarvestDashboardCompareProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { formatNum } = useLocaleFormatters();

  // Chart legends should mirror the picker: greenhouse first, variety second,
  // and skip the species/crop (it's the same crop across compared batches).
  // Falls back to batch.name if either piece is missing.
  const compareLabel = (batch: HarvestBatchListItem) => {
    const greenhouse = batch.greenhouse?.trim();
    const variety = batch.variety?.trim();
    if (greenhouse && variety) return `${greenhouse} - ${variety}`;
    if (greenhouse) return greenhouse;
    if (variety) return variety;
    return batch.name;
  };

  const selected = compareBatchIds
    .map((id, idx) => {
      const batch = batches.find((b) => b.id === id);
      return batch
        ? {
            batch,
            color: COMPARE_COLORS[idx % COMPARE_COLORS.length],
            label: compareLabel(batch),
          }
        : null;
    })
    .filter(
      (
        x,
      ): x is {
        batch: HarvestBatchListItem;
        color: string;
        label: string;
      } => !!x,
    );

  // Compare charts share a subtitle showing the crop(s) being compared. Most
  // sessions compare varieties within a single crop, so this collapses to a
  // single species; mixed-crop compares list all unique species deduped.
  const cropSubtitle = Array.from(
    new Set(
      selected
        .map(({ batch }) => batch.species?.trim())
        .filter((s): s is string => Boolean(s)),
    ),
  ).join(', ');

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

  const yieldSeries = selected.map(({ batch, color, label }) => ({
    batchId: batch.id,
    batchName: label,
    color,
    data: loaded[batch.id]?.data?.yieldOverTime ?? [],
  }));

  const yieldPerRunningMeterSeries = selected.map(({ batch, color, label }) => ({
    batchId: batch.id,
    batchName: label,
    color,
    data: loaded[batch.id]?.data?.yieldPerRunningMeterTrend ?? [],
  }));

  const brixSeries = selected.map(({ batch, color, label }) => ({
    batchId: batch.id,
    batchName: label,
    color,
    data: loaded[batch.id]?.data?.brixTrend ?? [],
  }));

  const fruitWeightSeries = selected.map(({ batch, color, label }) => ({
    batchId: batch.id,
    batchName: label,
    color,
    data: loaded[batch.id]?.data?.fruitWeightTrend ?? [],
  }));

  const cumulativeSeries = selected.map(({ batch, color, label }) => ({
    batchId: batch.id,
    batchName: label,
    color,
    data: loaded[batch.id]?.data?.cumulativeYield ?? [],
  }));

  const classSeries = selected.map(({ batch, color, label }) => {
    const data = loaded[batch.id]?.data;
    // classTotals is the per-quality sellable breakdown, positional and dynamic
    // (index 0=A, 1=B, 2=C, ...) — exactly the per-class array the chart stacks.
    return {
      batchId: batch.id,
      batchName: label,
      color,
      classes: data?.classTotals ?? [],
      waste: data?.wasteTotal ?? 0,
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
        {selected.map(({ batch, color, label }) => {
          const state = loaded[batch.id];
          const data = state?.data;
          const isLoading = state?.loading ?? true;
          const totalYield = data?.totalYield ?? 0;
          const marketablePercent = data?.marketablePercent ?? 0;
          const wastePercent = data?.wastePercent ?? 0;
          const averageBrix = data?.averageBrix ?? 0;
          const averageFruitWeight = data?.averageFruitWeight ?? 0;
          const yieldPerPlant = data?.yieldPerPlant ?? null;
          const yieldPerRunningMeter = data?.yieldPerRunningMeter ?? null;
          const daysActive = data?.daysActive ?? 0;
          const harvestCount = data?.harvestCount ?? 0;
          const acrossHarvests =
            h?.acrossHarvests?.replace('{count}', harvestCount.toString()) ??
            `Across ${harvestCount} harvests`;
          const fmt = (value: string | null) =>
            isLoading ? '–' : value == null ? '—' : value;
          return (
            <Card
              key={batch.id}
              className="gap-0 p-3"
              // Tint the card in the batch's series color so it still reads as
              // the legend key for the charts below, without a loud border.
              style={{ backgroundColor: `${color}14` }}
            >
              <p className="truncate text-base font-semibold">{label}</p>

              {/* Yields */}
              <div className="mt-3 space-y-1 text-xs">
                <MetricRow
                  label={h?.totalYield ?? 'Total Yield'}
                  value={fmt(`${formatNum(totalYield, 1)} kg`)}
                />
                <MetricRow
                  label={h?.yieldPerRunningMeterShort ?? 'Yield/Running Meter'}
                  value={fmt(
                    yieldPerRunningMeter == null
                      ? null
                      : `${formatNum(yieldPerRunningMeter, 3)} kg/m`,
                  )}
                />
                <MetricRow
                  label={h?.yieldPerPlantShort ?? 'Yield/Plant'}
                  value={fmt(
                    yieldPerPlant == null
                      ? null
                      : `${formatNum(yieldPerPlant * 1000, 1)} g`,
                  )}
                />
              </div>

              {/* Marketable vs waste */}
              <div className="mt-2 space-y-1 border-t pt-2 text-xs">
                <MetricRow
                  label={h?.marketablePercent ?? 'Marketable %'}
                  value={fmt(`${formatNum(marketablePercent, 1)}%`)}
                  valueClassName="text-emerald-600"
                />
                <MetricRow
                  label={h?.wastePercent ?? 'Waste %'}
                  value={fmt(`${formatNum(wastePercent, 1)}%`)}
                  valueClassName="text-red-600"
                />
              </div>

              {/* Averages */}
              <div className="mt-2 space-y-1 border-t pt-2 text-xs">
                <MetricRow
                  label={h?.averageBrix ?? 'Avg Brix'}
                  value={fmt(`${formatNum(averageBrix, 1)}°Bx`)}
                />
                <MetricRow
                  label={h?.averageFruitWeight ?? 'Avg Fruit Weight'}
                  value={fmt(`${formatNum(averageFruitWeight, 1)} g`)}
                />
              </div>

              {/* Batch metadata: harvest amount, crop, days active */}
              <p className="text-muted-foreground mt-2 border-t pt-2 text-xs">
                {isLoading
                  ? '–'
                  : [
                      acrossHarvests,
                      batch.species?.trim(),
                      `${daysActive} ${h?.daysActive ?? 'Days Active'}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </p>
              {!isLoading && harvestCount === 0 && (
                <p className="text-muted-foreground mt-1 text-xs italic">
                  {h?.noHarvestsInPeriod ?? 'No harvests in this period'}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-2">
        <YieldOverTimeChart series={yieldSeries} subtitle={cropSubtitle} />
        <YieldPerRunningMeterChart
          series={yieldPerRunningMeterSeries}
          subtitle={cropSubtitle}
        />
        <ClassDistributionChart series={classSeries} subtitle={cropSubtitle} />
        <BrixTrendChart series={brixSeries} subtitle={cropSubtitle} />
        <FruitWeightTrendChart
          series={fruitWeightSeries}
          subtitle={cropSubtitle}
        />
        <CumulativeYieldChart series={cumulativeSeries} subtitle={cropSubtitle} />
      </div>
    </div>
  );
}
