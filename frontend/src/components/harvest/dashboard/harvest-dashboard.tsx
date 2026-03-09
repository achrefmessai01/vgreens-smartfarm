import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { MetricCard } from './metric-card';
import { YieldOverTimeChart } from './yield-over-time-chart';
import { ClassDistributionChart } from './class-distribution-chart';
import { BrixTrendChart } from './brix-trend-chart';
import { CumulativeYieldChart } from './cumulative-yield-chart';
import { Calendar, Target, AlertTriangle, Activity, TrendingUp, Package } from 'lucide-react';

interface DashboardData {
  species: string;
  variety: string;
  harvestCount: number;
  totalYield: number;
  averageBrix: number;
  marketablePercent: number;
  wastePercent: number;
  wasteTotal: number;
  criticalAlerts: number;
  daysActive: number;
  yieldOverTime: Array<{date: string; yield: number}>;
  classDistribution: Array<{date: string; marketable: number; waste: number}>;
  brixTrend: Array<{date: string; brix: number}>;
  cumulativeYield: Array<{date: string; cumulative: number}>;
}

interface HarvestDashboardProps {
  data: DashboardData;
  className?: string;
}

export function HarvestDashboard({ data, className }: HarvestDashboardProps) {
  const { t } = useI18n();

  const formatAcrossHarvests = (count: number) => {
    return t.pages.harvest?.acrossHarvests?.replace('{count}', count.toString()) || 
           `Across ${count} harvests`;
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.pages.harvest?.performanceDashboard || 'Performance Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.species} - {data.variety} • {data.harvestCount} {t.pages.harvest?.harvestsLogged || 'harvests logged'}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4 mr-2" />
          {t.pages.harvest?.total || 'Total'}
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <MetricCard
          title={t.pages.harvest?.totalYield || 'Total Yield'}
          value={`${data.totalYield} kg`}
          subtitle={formatAcrossHarvests(data.harvestCount)}
          icon={<TrendingUp className="h-4 w-4" />}
          color="default"
        />
        <MetricCard
          title={t.pages.harvest?.averageBrix || 'Average Brix'}
          value={`${data.averageBrix}°Bx`}
          subtitle={t.pages.harvest?.qualityIndicator || 'Quality indicator'}
          icon={<Target className="h-4 w-4" />}
          color="info"
        />
        <MetricCard
          title={t.pages.harvest?.marketablePercent || 'Marketable %'}
          value={`${data.marketablePercent}%`}
          subtitle={t.pages.harvest?.marketableYield || 'Marketable yield'}
          icon={<Package className="h-4 w-4" />}
          color="success"
        />
        <MetricCard
          title={t.pages.harvest?.wastePercent || 'Waste %'}
          value={`${data.wastePercent}%`}
          subtitle={`${data.wasteTotal} ${t.pages.harvest?.kgTotal || 'kg total'}`}
          color="error"
        />
        <MetricCard
          title={t.pages.harvest?.criticalAlerts || 'Critical Alerts'}
          value={data.criticalAlerts}
          subtitle={t.pages.harvest?.requiresAttention || 'Requires attention'}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="warning"
        />
        <MetricCard
          title={t.pages.harvest?.daysActive || 'Days Active'}
          value={data.daysActive}
          subtitle={t.pages.harvest?.sincePlanting || 'Since planting'}
          icon={<Activity className="h-4 w-4" />}
          color="info"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldOverTimeChart data={data.yieldOverTime} />
        <ClassDistributionChart data={data.classDistribution} />
        <BrixTrendChart data={data.brixTrend} />
        <CumulativeYieldChart data={data.cumulativeYield as Array<{date: string; cumulative: number; cumulativeWaste: number}>} />
      </div>
    </div>
  );
}