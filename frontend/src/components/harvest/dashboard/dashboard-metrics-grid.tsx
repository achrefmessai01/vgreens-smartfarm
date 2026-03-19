import {
  Target,
  AlertTriangle,
  Activity,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { MetricCard } from './metric-card';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';

interface DashboardMetricsGridProps {
  data: HarvestDashboardData;
  filterLabel: string;
}

export function DashboardMetricsGrid({ data }: DashboardMetricsGridProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const acrossHarvests =
    h?.acrossHarvests?.replace('{count}', data.harvestCount.toString()) ??
    `Across ${data.harvestCount} harvests`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <MetricCard
        title={h?.totalYield ?? 'Total Yield'}
        value={`${data.totalYield?.toFixed(2) ?? 0} kg`}
        subtitle={acrossHarvests}
        icon={<TrendingUp className="h-4 w-4" />}
        color="default"
      />
      <MetricCard
        title={h?.averageBrix ?? 'Average Brix'}
        value={`${data.averageBrix?.toFixed(1) ?? 0}°Bx`}
        subtitle={h?.qualityIndicator ?? 'Quality indicator'}
        icon={<Target className="h-4 w-4" />}
        color="info"
      />
      <MetricCard
        title={h?.marketablePercent ?? 'Marketable %'}
        value={`${data.marketablePercent?.toFixed(1) ?? 0}%`}
        subtitle={`${((data.totalYield ?? 0) - (data.wasteTotal ?? 0)).toFixed(2)} ${h?.kgTotal ?? 'kg total'}`}
        icon={<Package className="h-4 w-4" />}
        color="success"
      />
      <MetricCard
        title={h?.wastePercent ?? 'Waste %'}
        value={`${data.wastePercent?.toFixed(1) ?? 0}%`}
        subtitle={`${data.wasteTotal?.toFixed(2) ?? 0} ${h?.kgTotal ?? 'kg total'}`}
        color="error"
      />
      <MetricCard
        title={h?.criticalAlerts ?? 'Critical Alerts'}
        value={data.criticalAlerts ?? 0}
        subtitle={h?.requiresAttention ?? 'Requires attention'}
        icon={<AlertTriangle className="h-4 w-4" />}
        color="warning"
      />
      <MetricCard
        title={h?.daysActive ?? 'Days Active'}
        value={data.daysActive ?? 0}
        subtitle={h?.sincePlanting ?? 'Since planting'}
        icon={<Activity className="h-4 w-4" />}
        color="info"
      />
    </div>
  );
}
