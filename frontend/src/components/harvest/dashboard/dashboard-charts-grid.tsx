import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  BrixTrendChart,
  ClassDistributionChart,
  CumulativeYieldChart,
  YieldOverTimeChart,
} from './charts';

interface DashboardChartsGridProps {
  data: HarvestDashboardData;
}

export function DashboardChartsGrid({ data }: DashboardChartsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      <YieldOverTimeChart data={data.yieldOverTime ?? []} />
      <ClassDistributionChart data={data.classDistribution ?? []} />
      <BrixTrendChart data={data.brixTrend ?? []} />
      <CumulativeYieldChart
        data={
          (data.cumulativeYield as Array<{
            date: string;
            cumulative: number;
            cumulativeWaste: number;
          }>) ?? []
        }
      />
    </div>
  );
}
