'use client';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { useHarvestBatches } from '@/lib/hooks/use-harvest-batches';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useHarvestDashboardUrlState } from '@/lib/hooks/use-harvest-dashboard-url-state';
import { AlertTriangle, Package } from 'lucide-react';
import { DashboardChartsGrid } from './dashboard-charts-grid';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import { HarvestDashboardCompare } from './harvest-dashboard-compare';
import { DashboardFilters } from './harvest-dashboard-filters';
import { HarvestDashboardSkeleton } from './harvest-dashboard-skeleton';
import { YieldPredictionCard } from './yield-prediction-card';

interface HarvestDashboardProps {
  className?: string;
  species?: string;
  variety?: string;
}

const FILTER_LABEL_KEYS: Record<DateFilter, string> = {
  today: 'today',
  thisWeek: 'thisWeek',
  lastWeek: 'lastWeek',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  total: 'total',
};

export function HarvestDashboard({
  className,
  species,
  variety,
}: HarvestDashboardProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const {
    period,
    batchId,
    compareBatchIds,
    compareMode,
    setPeriod,
    setBatchId,
    setCompareBatchIds,
    enterCompareMode,
    exitCompareMode,
  } = useHarvestDashboardUrlState();

  const { batches, loading: batchesLoading } = useHarvestBatches();

  const selectedBatch = batchId
    ? batches.find((b) => b.id === batchId)
    : undefined;
  const isStaleBatchId = Boolean(
    batchId && !batchesLoading && !selectedBatch && batches.length > 0,
  );

  const { data, loading, error, refetch } = useHarvestDashboard({
    dateFilter: period,
    species,
    variety,
    batchId: isStaleBatchId ? undefined : batchId,
  });

  const filterLabel =
    t.common?.[FILTER_LABEL_KEYS[period] as keyof typeof t.common] ?? period;

  const filterBar = (
    <DashboardFilters
      period={period}
      onPeriodChange={setPeriod}
      batches={batches}
      batchesLoading={batchesLoading}
      batchId={batchId}
      onBatchChange={setBatchId}
      compareMode={compareMode}
      compareBatchIds={compareBatchIds}
      onCompareToggle={() => (compareMode ? exitCompareMode() : enterCompareMode())}
      onCompareBatchesChange={setCompareBatchIds}
    />
  );

  if (compareMode) {
    return (
      <div className={className}>
        <div className="bg-card mb-5 rounded-xl border p-3 sm:mb-6 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {h?.performanceDashboard ?? 'Performance Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Comparing {compareBatchIds.length} batch
                {compareBatchIds.length === 1 ? '' : 'es'} for {filterLabel}
              </p>
            </div>
            {filterBar}
          </div>
        </div>
        <HarvestDashboardCompare
          batches={batches}
          compareBatchIds={compareBatchIds}
          period={period}
        />
      </div>
    );
  }

  if (loading && !data) return <HarvestDashboardSkeleton className={className} />;

  if (error) {
    return (
      <div className={className}>
        <div className="bg-card mb-5 rounded-xl border p-3 sm:mb-6 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {h?.performanceDashboard ?? 'Performance Dashboard'}
              </h1>
            </div>
            {filterBar}
          </div>
        </div>
        <div className="flex min-h-[300px] items-center justify-center px-4 sm:min-h-[400px]">
          <div className="max-w-md text-center">
            <AlertTriangle className="text-destructive mx-auto mb-3 h-6 w-6 sm:mb-4 sm:h-8 sm:w-8" />
            <p className="text-destructive mb-3 text-sm sm:mb-4 sm:text-base">
              {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              {t.common.retry ?? 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const noData = !data || data.harvestCount === 0;

  return (
    <div className={className}>
      <div className="bg-card mb-5 rounded-xl border p-3 sm:mb-6 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              {h?.performanceDashboard ?? 'Performance Dashboard'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {selectedBatch
                ? `${selectedBatch.name} · ${data?.harvestCount ?? 0} ${h?.harvestsLogged ?? 'harvests logged'} for ${filterLabel}`
                : `${data?.harvestCount ?? 0} ${h?.harvestsLogged ?? 'harvests logged'} for ${filterLabel}`}
            </p>
            {isStaleBatchId && (
              <p className="text-amber-600 mt-1 text-xs">
                Selected batch not found — showing all batches.
              </p>
            )}
          </div>
          {filterBar}
        </div>
      </div>

      {noData ? (
        <div className="flex min-h-[300px] items-center justify-center px-4 sm:min-h-[400px]">
          <div className="max-w-md text-center">
            <Package className="text-muted-foreground mx-auto mb-3 h-6 w-6 sm:mb-4 sm:h-8 sm:w-8" />
            <p className="text-muted-foreground text-sm sm:text-base">
              {selectedBatch
                ? `No harvests for ${selectedBatch.name} in ${filterLabel}`
                : (h?.noHarvestsYet ?? 'No harvest data available')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <DashboardMetricsGrid data={data} />
          <YieldPredictionCard />
          <DashboardChartsGrid data={data} />
        </>
      )}
    </div>
  );
}
