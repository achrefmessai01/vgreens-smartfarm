import { useI18n } from '@/i18n';
import { useLocaleFormatters } from '@/i18n/use-locale-formatters';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import {
  Activity,
  Grid2x2,
  Package,
  Ruler,
  Scale,
  Sprout,
  Target,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from './metric-card/metric-card';
import { DASHBOARD_METRIC_IDS } from './dashboard-items';
import { SortableGrid } from './sortable-grid';
import { mergeVisibleOrder } from '@/lib/hooks/use-harvest-dashboard-order';

const GRID_CLASSNAME =
  'mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-3';

interface DashboardMetricsGridProps {
  data: HarvestDashboardData;
  /** Visibility predicate keyed by dashboard item id. Defaults to all visible. */
  isVisible?: (id: string) => boolean;
  /** Reorders the metric cards to match the tenant's saved order. */
  applyOrder?: <T extends { id: string }>(items: T[]) => T[];
  /** When true, cards become draggable to reorder. */
  editMode?: boolean;
  /** Called with the new full metric-id order (hidden items preserved). */
  onReorder?: (orderedIds: string[]) => void;
}

export function DashboardMetricsGrid({
  data,
  isVisible = () => true,
  applyOrder = (items) => items,
  editMode = false,
  onReorder,
}: DashboardMetricsGridProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const { formatNum } = useLocaleFormatters();

  const acrossHarvests =
    h?.acrossHarvests?.replace('{count}', data.harvestCount.toString()) ??
    `Across ${data.harvestCount} harvests`;

  // totalYield comes from the backend already waste-free (yield never includes
  // waste): it is the sellable/marketable kg across all quality classes.
  const sellableTotal = data.totalYield ?? 0;
  const primaryPercent = data.marketablePercent ?? 0;
  const secondaryPercent = data.wastePercent ?? 0;
  const secondaryTotal = data.wasteTotal ?? 0;

  const primaryTitle = h?.marketablePercent ?? 'Marketable %';
  const secondaryTitle = h?.wastePercent ?? 'Waste %';

  // Tile order is product-driven: headline marketable kg first, then the two
  // percentages that explain its composition, then the per-unit yields, then
  // the rest. The `totalYield` id is kept (it's persisted in tenant configs)
  // even though the tile now shows marketable kg — renaming the id would
  // silently un-hide it for tenants who'd already hidden it.
  const cards: Array<{ id: string; node: React.ReactNode }> = [
    {
      id: DASHBOARD_METRIC_IDS.totalYield,
      node: (
        <MetricCard
          title={h?.totalMarketableYield ?? 'Marketable Yield'}
          value={`${formatNum(sellableTotal, 2)} kg`}
          subtitle={acrossHarvests}
          icon={<TrendingUp className="h-4 w-4" />}
          color="success"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.qualityPrimary,
      node: (
        <MetricCard
          title={primaryTitle}
          value={`${formatNum(primaryPercent, 1)}%`}
          subtitle={`${formatNum(sellableTotal, 2)} ${h?.kgTotal ?? 'kg total'}`}
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
          value={`${formatNum(secondaryPercent, 1)}%`}
          subtitle={`${formatNum(secondaryTotal, 2)} ${h?.kgTotal ?? 'kg total'}`}
          color="error"
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
              : `${formatNum(data.yieldPerPlant * 1000, 1)} g`
          }
          subtitle={
            data.yieldPerPlant == null
              ? (h?.yieldPerPlantNoData ?? 'Set Total Plants on the batch')
              : (h?.yieldPerPlantSubtitle ?? 'Sellable g per plant')
          }
          icon={<Sprout className="h-4 w-4" />}
          color="default"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.yieldPerRunningMeter,
      node: (
        <MetricCard
          title={h?.yieldPerRunningMeter ?? 'Yield per Running Meter'}
          value={
            data.yieldPerRunningMeter == null
              ? '—'
              : `${formatNum(data.yieldPerRunningMeter, 3)} kg/m`
          }
          subtitle={
            data.yieldPerRunningMeter == null
              ? (h?.yieldPerRunningMeterNoData ??
                'Set Row Length and Number of Rows on the batch')
              : (h?.yieldPerRunningMeterSubtitle ??
                'Sellable kg per running metre')
          }
          icon={<Ruler className="h-4 w-4" />}
          color="default"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.averageFruitWeight,
      node: (
        <MetricCard
          title={h?.averageFruitWeight ?? 'Average Fruit Weight'}
          value={`${formatNum(data.averageFruitWeight ?? 0, 1)} g`}
          subtitle={h?.avgWeightPerFruit ?? 'Average weight per fruit'}
          icon={<Scale className="h-4 w-4" />}
          color="info"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.averageBrix,
      node: (
        <MetricCard
          title={h?.averageBrix ?? 'Average Brix'}
          value={`${formatNum(data.averageBrix ?? 0, 1)}°Bx`}
          subtitle={h?.qualityIndicator ?? 'Quality indicator'}
          icon={<Target className="h-4 w-4" />}
          color="info"
        />
      ),
    },
    {
      id: DASHBOARD_METRIC_IDS.yieldPerSquareMeter,
      node: (
        <MetricCard
          title={h?.yieldPerSquareMeter ?? 'Yield per m²'}
          value={
            data.yieldPerSquareMeter == null
              ? '—'
              : `${formatNum(data.yieldPerSquareMeter, 2)} kg/m²`
          }
          subtitle={
            data.yieldPerSquareMeter == null
              ? (h?.yieldPerSquareMeterNoData ??
                'Set cultivation area on the batch')
              : (h?.yieldPerSquareMeterSubtitle ?? 'Total kg per m²')
          }
          icon={<Grid2x2 className="h-4 w-4" />}
          color="default"
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

  const orderedCards = applyOrder(cards);
  const visibleCards = orderedCards.filter((card) => isVisible(card.id));

  if (visibleCards.length === 0) return null;

  // Reorder only touches visible cards; splice the new visible order back into
  // the full metric order so hidden cards keep their saved slots.
  const handleReorder = (orderedVisibleIds: string[]) => {
    onReorder?.(
      mergeVisibleOrder(
        orderedCards.map((card) => card.id),
        orderedVisibleIds,
        isVisible,
      ),
    );
  };

  return (
    <SortableGrid
      items={visibleCards}
      className={GRID_CLASSNAME}
      editMode={editMode}
      onReorder={handleReorder}
    />
  );
}
