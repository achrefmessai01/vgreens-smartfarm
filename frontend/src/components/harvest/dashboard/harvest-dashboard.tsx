'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import { useHarvestBatches } from '@/lib/hooks/use-harvest-batches';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useHarvestDashboardUrlState } from '@/lib/hooks/use-harvest-dashboard-url-state';
import { useHarvestDashboardVisibility } from '@/lib/hooks/use-harvest-dashboard-visibility';
import { useHarvestDashboardOrder } from '@/lib/hooks/use-harvest-dashboard-order';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useSetTenantHarvestDashboardOrderMutation } from '@/generated/graphql';
import { harvestsLoggedForLabel } from '@/lib/harvest-utils';
import { AlertTriangle, Check, LayoutDashboard, Move, Package } from 'lucide-react';
import { DashboardChartsGrid } from './dashboard-charts-grid';
import { DashboardConfigMenu } from './dashboard-config-menu';
import { DashboardMetricsGrid } from './dashboard-metrics-grid';
import {
  DASHBOARD_CHART_IDS,
  DASHBOARD_METRIC_IDS,
} from './dashboard-items';
import { HarvestDashboardCompare } from './harvest-dashboard-compare';
import { DashboardFilters } from './harvest-dashboard-filters';
import { HarvestDashboardSkeleton } from './harvest-dashboard-skeleton';
import { YieldPredictionCard } from './yield-prediction-card';

const METRIC_ID_SET = new Set<string>(Object.values(DASHBOARD_METRIC_IDS));
const CHART_ID_SET = new Set<string>(Object.values(DASHBOARD_CHART_IDS));

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

  const { toast } = useToast();
  const { isTenantAdmin } = useCurrentUser();
  const { isVisible, allHidden, tenantId, hiddenSet } =
    useHarvestDashboardVisibility();
  const { order, applyOrder } = useHarvestDashboardOrder();
  const canEditDashboard = isTenantAdmin && Boolean(tenantId);

  const [editLayout, setEditLayout] = React.useState(false);
  const [setOrderMutation] = useSetTenantHarvestDashboardOrderMutation();

  // Persist a full ordered id list (metrics + charts). Optimistic cache update
  // mirrors the visibility editor so the new order sticks without a refetch.
  const persistOrder = React.useCallback(
    async (orderedIds: string[]) => {
      if (!tenantId) return;
      try {
        await setOrderMutation({
          variables: { orderedIds, tenantId },
          update: (cache, result) => {
            const updated = result.data?.setTenantHarvestDashboardOrder;
            if (!updated) return;
            cache.modify({
              id: cache.identify({ __typename: 'Tenant', id: updated.id }),
              fields: {
                harvestDashboardOrder: () => updated.harvestDashboardOrder,
              },
            });
          },
        });
      } catch (err) {
        toast({
          title: h?.configLayoutSaveFailed ?? 'Failed to save dashboard layout',
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      }
    },
    [setOrderMutation, tenantId, toast, h],
  );

  // The two grids share one stored list. When one grid reports its new full
  // order, keep the other category's existing order (from the stored list) and
  // concatenate — each grid only ever reads its own ids back out.
  const handleReorderMetrics = React.useCallback(
    (metricOrder: string[]) => {
      void persistOrder([
        ...metricOrder,
        ...order.filter((id) => CHART_ID_SET.has(id)),
      ]);
    },
    [order, persistOrder],
  );

  const handleReorderCharts = React.useCallback(
    (chartOrder: string[]) => {
      void persistOrder([
        ...order.filter((id) => METRIC_ID_SET.has(id)),
        ...chartOrder,
      ]);
    },
    [order, persistOrder],
  );

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

  // Force a plain `string` here. Without the coercion, TS infers the union of
  // every literal in `t.common` (plus one nested object), which trips up
  // `.replace(_, filterLabel)` overload resolution further down. `t.common`
  // does include a nested key, so we guard against the object case explicitly.
  const filterLabelRaw =
    t.common?.[FILTER_LABEL_KEYS[period] as keyof typeof t.common] ?? period;
  const filterLabel: string =
    typeof filterLabelRaw === 'string' ? filterLabelRaw : period;

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
                    'Comparing {count} batches for {filter}')
                )
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

  if (loading && !data)
    return <HarvestDashboardSkeleton className={className} />;

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
              <p className="mt-1 text-xs text-amber-600">
                {h?.selectedBatchNotFound ??
                  'Selected batch not found — showing all batches.'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filterBar}
            {canEditDashboard && tenantId && (
              <>
                <DashboardConfigMenu tenantId={tenantId} hiddenSet={hiddenSet} />
                <Button
                  variant={editLayout ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => setEditLayout((prev) => !prev)}
                  aria-pressed={editLayout}
                >
                  {editLayout ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Move className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">
                    {editLayout
                      ? (h?.configDoneLayout ?? 'Done')
                      : (h?.configEditLayout ?? 'Edit layout')}
                  </span>
                </Button>
              </>
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
                ? (
                    h?.noHarvestsForBatch ??
                    'No harvests for {name} in {filter}'
                  )
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
          <DashboardMetricsGrid
            data={data}
            isVisible={isVisible}
            applyOrder={applyOrder}
            editMode={editLayout}
            onReorder={handleReorderMetrics}
          />
          <YieldPredictionCard />
          <DashboardChartsGrid
            data={data}
            isVisible={isVisible}
            applyOrder={applyOrder}
            editMode={editLayout}
            onReorder={handleReorderCharts}
          />
        </>
      )}
    </div>
  );
}
