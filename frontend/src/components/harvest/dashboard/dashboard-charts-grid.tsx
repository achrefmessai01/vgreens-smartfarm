import { YieldOverTimeChart } from './yield-over-time-chart';
import { ClassDistributionChart } from './class-distribution-chart';
import { BrixTrendChart } from './brix-trend-chart';
import { CumulativeYieldChart } from './cumulative-yield-chart';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';

interface DashboardChartsGridProps {
  data: HarvestDashboardData;
}

export function DashboardChartsGrid({ data }: DashboardChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
