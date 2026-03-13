import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { MetricCard } from './metric-card';
import { YieldOverTimeChart } from './yield-over-time-chart';
import { ClassDistributionChart } from './class-distribution-chart';
import { BrixTrendChart } from './brix-trend-chart';
import { CumulativeYieldChart } from './cumulative-yield-chart';
import { DashboardFilters } from './dashboard-filters';
import { HarvestDashboardSkeleton } from './harvest-dashboard-skeleton';
import {
  Target,
  AlertTriangle,
  Activity,
  TrendingUp,
  Package,
} from 'lucide-react';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';

interface HarvestDashboardProps {
  className?: string;
  species?: string;
  variety?: string;
}

export function HarvestDashboard({
  className,
  species,
  variety,
}: HarvestDashboardProps) {
  const { t } = useI18n();
  const [currentFilter, setCurrentFilter] = useState<DateFilter>('thisMonth');

  // When 'total' is selected, pass no filter to show all harvests
  const { data, loading, error, refetch } = useHarvestDashboard(
    currentFilter === 'total'
      ? undefined
      : {
          dateFilter: currentFilter,
          species,
          variety,
        },
  );

  const handleFilterChange = (filter: { dateFilter?: DateFilter }) => {
    if (filter.dateFilter && filter.dateFilter !== currentFilter) {
      setCurrentFilter(filter.dateFilter);
    }
  };

  const formatAcrossHarvests = (count: number) => {
    return (
      t.pages.harvest?.acrossHarvests?.replace('{count}', count.toString()) ||
      `Across ${count} harvests`
    );
  };

  const getFilterLabel = (filter: DateFilter) => {
    const filterLabels = {
      today: t.common?.today || 'today',
      thisWeek: t.common?.thisWeek || 'this week',
      lastWeek: t.common?.lastWeek || 'last week',
      thisMonth: t.common?.thisMonth || 'this month',
      lastMonth: t.common?.lastMonth || 'last month',
      total: t.common?.total || 'total',
    };
    return filterLabels[filter] || filter;
  };

  if (loading) {
    return <HarvestDashboardSkeleton className={className} />;
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">
            {error?.message || 'An error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {t.common.retry || 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <div className="text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No harvest data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.pages.harvest?.performanceDashboard || 'Performance Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.harvestCount}{' '}
            {t.pages.harvest?.harvestsLogged || 'harvests logged'} for{' '}
            {getFilterLabel(currentFilter)}
          </p>
        </div>
        <DashboardFilters
          onFilterChange={handleFilterChange}
          className="w-64"
          defaultValue={currentFilter}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <MetricCard
          title={t.pages.harvest?.totalYield || 'Total Yield'}
          value={`${data.totalYield?.toFixed(2) || 0} kg`}
          subtitle={formatAcrossHarvests(data.harvestCount)}
          icon={<TrendingUp className="h-4 w-4" />}
          color="default"
        />
        <MetricCard
          title={t.pages.harvest?.averageBrix || 'Average Brix'}
          value={`${data.averageBrix?.toFixed(1) || 0}°Bx`}
          subtitle={t.pages.harvest?.qualityIndicator || 'Quality indicator'}
          icon={<Target className="h-4 w-4" />}
          color="info"
        />
        <MetricCard
          title={t.pages.harvest?.marketablePercent || 'Marketable %'}
          value={`${data.marketablePercent?.toFixed(1) || 0}%`}
          subtitle={`${((data.totalYield || 0) - (data.wasteTotal || 0)).toFixed(2)} ${t.pages.harvest?.kgTotal || 'kg total'}`}
          icon={<Package className="h-4 w-4" />}
          color="success"
        />
        <MetricCard
          title={t.pages.harvest?.wastePercent || 'Waste %'}
          value={`${data.wastePercent?.toFixed(1) || 0}%`}
          subtitle={`${data.wasteTotal?.toFixed(2) || 0} ${t.pages.harvest?.kgTotal || 'kg total'}`}
          color="error"
        />
        <MetricCard
          title={t.pages.harvest?.criticalAlerts || 'Critical Alerts'}
          value={data.criticalAlerts || 0}
          subtitle={t.pages.harvest?.requiresAttention || 'Requires attention'}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="warning"
        />
        <MetricCard
          title={t.pages.harvest?.daysActive || 'Days Active'}
          value={data.daysActive || 0}
          subtitle={t.pages.harvest?.sincePlanting || 'Since planting'}
          icon={<Activity className="h-4 w-4" />}
          color="info"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldOverTimeChart data={data.yieldOverTime || []} />
        <ClassDistributionChart data={data.classDistribution || []} />
        <BrixTrendChart data={data.brixTrend || []} />
        <CumulativeYieldChart
          data={
            (data.cumulativeYield as Array<{
              date: string;
              cumulative: number;
              cumulativeWaste: number;
            }>) || []
          }
        />
      </div>
    </div>
  );
}
