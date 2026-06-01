import { useI18n } from '@/i18n';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  Activity,
  AlertTriangle,
  Package,
  Scale,
  Sprout,
  Target,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from './metric-card/metric-card';

interface DashboardMetricsGridProps {
  data: HarvestDashboardData;
}

export function DashboardMetricsGrid({ data }: DashboardMetricsGridProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const classBMode = useHarvestClassBMode();

  const acrossHarvests =
    h?.acrossHarvests?.replace('{count}', data.harvestCount.toString()) ??
    `Across ${data.harvestCount} harvests`;

  const classATotal = (data.totalYield ?? 0) - (data.wasteTotal ?? 0);
  const classBTotal = data.classBTotal ?? 0;
  const qualityYield = classATotal + classBTotal;

  const totalYieldDisplay = classBMode ? qualityYield : (data.totalYield ?? 0);
  const primaryPercent = classBMode
    ? (qualityYield > 0 ? (classATotal / qualityYield) * 100 : 0)
    : (data.marketablePercent ?? 0);
  const secondaryPercent = classBMode
    ? (qualityYield > 0 ? (classBTotal / qualityYield) * 100 : 0)
    : (data.wastePercent ?? 0);
  const secondaryTotal = classBMode ? classBTotal : (data.wasteTotal ?? 0);

  const primaryTitle = classBMode
    ? (h?.quality1Percent ?? 'Quality 1 %')
    : (h?.marketablePercent ?? 'Marketable %');
  const secondaryTitle = classBMode
    ? (h?.quality2Percent ?? 'Quality 2 %')
    : (h?.wastePercent ?? 'Waste %');

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title={h?.totalYield ?? 'Total Yield'}
        value={`${totalYieldDisplay.toFixed(2)} kg`}
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
        title={h?.averageFruitWeight ?? 'Average Fruit Weight'}
        value={`${data.averageFruitWeight?.toFixed(3) ?? 0} kg`}
        subtitle={h?.avgWeightPerFruit ?? 'Average weight per fruit'}
        icon={<Scale className="h-4 w-4" />}
        color="info"
      />
      <MetricCard
        title={h?.yieldPerPlant ?? 'Yield per Plant'}
        value={
          data.yieldPerPlant == null
            ? '—'
            : `${data.yieldPerPlant.toFixed(2)} kg`
        }
        subtitle={
          data.yieldPerPlant == null
            ? (h?.yieldPerPlantNoData ?? 'Set Total Plants on the batch')
            : (h?.yieldPerPlantSubtitle ?? 'Sellable kg per plant')
        }
        icon={<Sprout className="h-4 w-4" />}
        color="default"
      />
      <MetricCard
        title={primaryTitle}
        value={`${primaryPercent.toFixed(1)}%`}
        subtitle={`${classATotal.toFixed(2)} ${h?.kgTotal ?? 'kg total'}`}
        icon={<Package className="h-4 w-4" />}
        color="success"
      />
      <MetricCard
        title={secondaryTitle}
        value={`${secondaryPercent.toFixed(1)}%`}
        subtitle={`${secondaryTotal.toFixed(2)} ${h?.kgTotal ?? 'kg total'}`}
        color={classBMode ? 'success' : 'error'}
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
