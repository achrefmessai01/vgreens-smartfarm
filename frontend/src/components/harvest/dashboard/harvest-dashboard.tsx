'use client';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { useHarvestBatches } from '@/lib/hooks/use-harvest-batches';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useHarvestDashboardUrlState } from '@/lib/hooks/use-harvest-dashboard-url-state';
import { useHarvestDashboardVisibility } from '@/lib/hooks/use-harvest-dashboard-visibility';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { harvestsLoggedForLabel } from '@/lib/harvest-utils';
import { AlertTriangle, LayoutDashboard, Package } from 'lucide-react';
import { DashboardChartsGrid } from './dashboard-charts-grid';
import { DashboardConfigMenu } from './dashboard-config-menu';
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
  const { t, locale } = useI18n();
  const h = t.pages.harvest;

  const {
    period,
    batchId,
    compareBatchIds,
    compareMode,
    setPeriod,
    setCompareBatchIds,
  } = useHarvestDashboardUrlState();

  const { batches, loading: batchesLoading } = useHarvestBatches();

  const { isTenantAdmin } = useCurrentUser();
  const { isVisible, allHidden, tenantId, hiddenSet } =
    useHarvestDashboardVisibility();
  const canEditDashboard = isTenantAdmin && Boolean(tenantId);

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
      compareBatchIds={compareBatchIds}
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
                {(compareBatchIds.length === 1
                  ? (h?.comparing ?? 'Comparing {count} batch for {filter}')
                  : (h?.comparingPlural ??
                    'Comparing {count} batches for {filter}'))
                  .replace('{count}', String(compareBatchIds.length))
                  .replace('{filter}', filterLabel)}
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
              {t.common.retry}
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
              {(() => {
                const count = data?.harvestCount ?? 0;
                const phrase = `${count} ${harvestsLoggedForLabel(count, h, locale)} ${filterLabel}`;
                return selectedBatch
                  ? `${selectedBatch.name} · ${phrase}`
                  : phrase;
              })()}
            </p>
            {isStaleBatchId && (
              <p className="text-amber-600 mt-1 text-xs">
                {h?.selectedBatchNotFound ??
                  'Selected batch not found — showing all batches.'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filterBar}
            {canEditDashboard && tenantId && (
              <DashboardConfigMenu tenantId={tenantId} hiddenSet={hiddenSet} />
            )}
          </div>
        </div>
      </div>

      {noData ? (
        <div className="flex min-h-[300px] items-center justify-center px-4 sm:min-h-[400px]">
          <div className="max-w-md text-center">
            <Package className="text-muted-foreground mx-auto mb-3 h-6 w-6 sm:mb-4 sm:h-8 sm:w-8" />
            <p className="text-muted-foreground text-sm sm:text-base">
              {selectedBatch
                ? (h?.noHarvestsForBatch ?? 'No harvests for {name} in {filter}')
                    .replace('{name}', selectedBatch.name)
                    .replace('{filter}', filterLabel)
                : (h?.noHarvestsYet ?? 'No harvest data available')}
            </p>
          </div>
        </div>
      ) : allHidden ? (
        <div className="flex min-h-[300px] items-center justify-center px-4 sm:min-h-[400px]">
          <div className="max-w-md text-center">
            <LayoutDashboard className="text-muted-foreground mx-auto mb-3 h-6 w-6 sm:mb-4 sm:h-8 sm:w-8" />
            <p className="text-foreground mb-1 text-sm font-medium sm:text-base">
              {h?.configEmptyTitle ?? 'No dashboard items selected'}
            </p>
            <p className="text-muted-foreground text-sm">
              {canEditDashboard
                ? (h?.configEmptyHintAdmin ??
                  'Use "Edit dashboard" to choose what appears here.')
                : (h?.configEmptyHint ??
                  'No visualizations are enabled for this dashboard.')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <DashboardMetricsGrid data={data} isVisible={isVisible} />
          <YieldPredictionCard />
          <DashboardChartsGrid data={data} isVisible={isVisible} />
        </>
      )}
    </div>
  );
}
