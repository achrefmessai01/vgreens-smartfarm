import { useI18n } from '@/i18n';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  Activity,
  AlertTriangle,
  Package,
  Ruler,
  Scale,
  Sprout,
  Target,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from './metric-card/metric-card';
import { DASHBOARD_METRIC_IDS } from './dashboard-items';

interface DashboardMetricsGridProps {
  data: HarvestDashboardData;
  /** Visibility predicate keyed by dashboard item id. Defaults to all visible. */
  isVisible?: (id: string) => boolean;
}

export function DashboardMetricsGrid({
  data,
  isVisible = () => true,
}: DashboardMetricsGridProps) {
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

  const cards: Array<{ id: string; node: React.ReactNode }> = [
    {
      id: DASHBOARD_METRIC_IDS.totalYield,
      node: (
        <MetricCard
          title={h?.totalYield ?? 'Total Yield'}
          value={`${totalYieldDisplay.toFixed(2)} kg`}
          subtitle={acrossHarvests}
          icon={<TrendingUp className="h-4 w-4" />}
          color="default"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.averageBrix,
      node: (
        <MetricCard
          title={h?.averageBrix ?? 'Average Brix'}
          value={`${data.averageBrix?.toFixed(1) ?? 0}°Bx`}
          subtitle={h?.qualityIndicator ?? 'Quality indicator'}
          icon={<Target className="h-4 w-4" />}
          color="info"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.averageFruitWeight,
      node: (
        <MetricCard
          title={h?.averageFruitWeight ?? 'Average Fruit Weight'}
          value={`${data.averageFruitWeight?.toFixed(3) ?? 0} kg`}
          subtitle={h?.avgWeightPerFruit ?? 'Average weight per fruit'}
          icon={<Scale className="h-4 w-4" />}
          color="info"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.yieldPerPlant,
      node: (
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
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.yieldPerMeter,
      node: (
        <MetricCard
          title={h?.yieldPerMeter ?? 'Yield per Meter'}
          value={
            data.yieldPerMeter == null
              ? '—'
              : `${data.yieldPerMeter.toFixed(2)} kg/m`
          }
          subtitle={
            data.yieldPerMeter == null
              ? (h?.yieldPerMeterNoData ?? 'Set Row Length on the batch')
              : (h?.yieldPerMeterSubtitle ?? 'Sellable kg per row metre')
          }
          icon={<Ruler className="h-4 w-4" />}
          color="default"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.qualityPrimary,
      node: (
        <MetricCard
          title={primaryTitle}
          value={`${primaryPercent.toFixed(1)}%`}
          subtitle={`${classATotal.toFixed(2)} ${h?.kgTotal ?? 'kg total'}`}
          icon={<Package className="h-4 w-4" />}
          color="success"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.qualitySecondary,
      node: (
        <MetricCard
          title={secondaryTitle}
          value={`${secondaryPercent.toFixed(1)}%`}
          subtitle={`${secondaryTotal.toFixed(2)} ${h?.kgTotal ?? 'kg total'}`}
          color={classBMode ? 'success' : 'error'}
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.criticalAlerts,
      node: (
        <MetricCard
          title={h?.criticalAlerts ?? 'Critical Alerts'}
          value={data.criticalAlerts ?? 0}
          subtitle={h?.requiresAttention ?? 'Requires attention'}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="warning"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.daysActive,
      node: (
        <MetricCard
          title={h?.daysActive ?? 'Days Active'}
          value={data.daysActive ?? 0}
          subtitle={h?.sincePlanting ?? 'Since planting'}
          icon={<Activity className="h-4 w-4" />}
          color="info"
        />
      ),
    },
  ];

  const visibleCards = cards.filter((card) => isVisible(card.id));

  if (visibleCards.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visibleCards.map((card) => (
        <div key={card.id}>{card.node}</div>
      ))}
    </div>
  );
}
