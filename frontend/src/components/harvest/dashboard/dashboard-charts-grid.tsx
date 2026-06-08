import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  BrixTrendChart,
  ClassDistributionChart,
  CumulativeYieldChart,
  FruitWeightTrendChart,
  YieldOverTimeChart,
  YieldPerMeterChart,
} from './charts';
import { DASHBOARD_CHART_IDS } from './dashboard-items';

interface DashboardChartsGridProps {
  data: HarvestDashboardData;
  /** Visibility predicate keyed by dashboard item id. Defaults to all visible. */
  isVisible?: (id: string) => boolean;
}

export function DashboardChartsGrid({
  data,
  isVisible = () => true,
}: DashboardChartsGridProps) {
  const charts: Array<{ id: string; node: React.ReactNode }> = [
    {
      id: DASHBOARD_CHART_IDS.yieldOverTime,
      node: <YieldOverTimeChart data={data.yieldOverTime ?? []} />,
    },
    {
      id: DASHBOARD_CHART_IDS.yieldPerMeterTrend,
      node: <YieldPerMeterChart data={data.yieldPerMeterTrend ?? []} />,
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
      node: (
        <CumulativeYieldChart
          data={
            (data.cumulativeYield as Array<{
              date: string;
              cumulativeClassA: number;
              cumulativeClassB: number;
              cumulativeClassC: number;
              cumulativeWaste: number;
            }>) ?? []
          }
        />
      ),
    },
  ];

  const visibleCharts = charts.filter((chart) => isVisible(chart.id));

  if (visibleCharts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {visibleCharts.map((chart) => (
        <div key={chart.id}>{chart.node}</div>
      ))}
    </div>
  );
}
