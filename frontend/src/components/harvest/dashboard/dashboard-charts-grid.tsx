import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  BrixTrendChart,
  ClassDistributionChart,
  CumulativeYieldChart,
  FruitWeightTrendChart,
  YieldOverTimeChart,
  YieldPerRunningMeterChart,
} from './charts';
import { DASHBOARD_CHART_IDS } from './dashboard-items';
import { SortableGrid } from './sortable-grid';
import { mergeVisibleOrder } from '@/lib/hooks/use-harvest-dashboard-order';

const GRID_CLASSNAME =
  'grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-2';

interface DashboardChartsGridProps {
  data: HarvestDashboardData;
  /** Visibility predicate keyed by dashboard item id. Defaults to all visible. */
  isVisible?: (id: string) => boolean;
  /** Reorders the charts to match the tenant's saved order. */
  applyOrder?: <T extends { id: string }>(items: T[]) => T[];
  /** When true, charts become draggable to reorder. */
  editMode?: boolean;
  /** Called with the new full chart-id order (hidden items preserved). */
  onReorder?: (orderedIds: string[]) => void;
}

export function DashboardChartsGrid({
  data,
  isVisible = () => true,
  applyOrder = (items) => items,
  editMode = false,
  onReorder,
}: DashboardChartsGridProps) {
  const charts: Array<{ id: string; node: React.ReactNode }> = [
    {
      id: DASHBOARD_CHART_IDS.yieldOverTime,
      node: <YieldOverTimeChart data={data.yieldOverTime ?? []} />,
    },
    {
      id: DASHBOARD_CHART_IDS.yieldPerRunningMeterTrend,
      node: (
        <YieldPerRunningMeterChart
          data={data.yieldPerRunningMeterTrend ?? []}
        />
      ),
    },
    {
      id: DASHBOARD_CHART_IDS.classDistribution,
      node: <ClassDistributionChart data={data.classDistribution ?? []} />,
    },
    {
      id: DASHBOARD_CHART_IDS.brixTrend,
      node: <BrixTrendChart data={data.brixTrend ?? []} />,
    },
    {
      id: DASHBOARD_CHART_IDS.fruitWeightTrend,
      node: <FruitWeightTrendChart data={data.fruitWeightTrend ?? []} />,
    },
    {
      id: DASHBOARD_CHART_IDS.cumulativeYield,
      node: <CumulativeYieldChart data={data.cumulativeYield ?? []} />,
    },
  ];

  const orderedCharts = applyOrder(charts);
  const visibleCharts = orderedCharts.filter((chart) => isVisible(chart.id));

  if (visibleCharts.length === 0) return null;

  // Reorder only touches visible charts; splice the new visible order back into
  // the full chart order so hidden charts keep their saved slots.
  const handleReorder = (orderedVisibleIds: string[]) => {
    onReorder?.(
      mergeVisibleOrder(
        orderedCharts.map((chart) => chart.id),
        orderedVisibleIds,
        isVisible,
      ),
    );
  };

  return (
    <SortableGrid
      items={visibleCharts}
      className={GRID_CLASSNAME}
      editMode={editMode}
      onReorder={handleReorder}
    />
  );
}
