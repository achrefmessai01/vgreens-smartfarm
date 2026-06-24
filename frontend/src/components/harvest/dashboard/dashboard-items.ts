/**
 * Registry of every configurable item on the harvest performance dashboard.
 *
 * This is the single source of truth for the "Edit dashboard" editor and for
 * the visibility filtering applied by the metrics/charts grids. Each item has a
 * stable `id` that is persisted (as part of the tenant's
 * `hiddenHarvestDashboardItems`) — never rename an id without a migration.
 *
 * Visibility is stored as the *hidden* set, so any item added here later is
 * visible by default for tenants that configured their dashboard previously.
 */

export type DashboardItemCategory = 'metrics' | 'charts';

export interface DashboardItem {
  /** Stable identifier persisted in `Tenant.hiddenHarvestDashboardItems`. */
  id: string;
  /** Key under `t.pages.harvest` used for the editor label. */
  labelKey: string;
  /** English fallback, matching the `?? '…'` idiom used across the dashboard. */
  fallback: string;
  category: DashboardItemCategory;
}

export const DASHBOARD_METRIC_IDS = {
  totalYield: 'totalYield',
  averageBrix: 'averageBrix',
  averageFruitWeight: 'averageFruitWeight',
  yieldPerPlant: 'yieldPerPlant',
  yieldPerMeter: 'yieldPerMeter',
  qualityPrimary: 'qualityPrimary',
  qualitySecondary: 'qualitySecondary',
  criticalAlerts: 'criticalAlerts',
  daysActive: 'daysActive',
} as const;

export const DASHBOARD_CHART_IDS = {
  yieldOverTime: 'yieldOverTime',
  yieldPerMeterTrend: 'yieldPerMeterTrend',
  yieldPerRunningMeterTrend: 'yieldPerRunningMeterTrend',
  classDistribution: 'classDistribution',
  brixTrend: 'brixTrend',
  fruitWeightTrend: 'fruitWeightTrend',
  cumulativeYield: 'cumulativeYield',
} as const;

export const HARVEST_DASHBOARD_ITEMS: readonly DashboardItem[] = [
  // Metrics
  {
    id: DASHBOARD_METRIC_IDS.totalYield,
    labelKey: 'totalYield',
    fallback: 'Total Yield',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.averageBrix,
    labelKey: 'averageBrix',
    fallback: 'Average Brix',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.averageFruitWeight,
    labelKey: 'averageFruitWeight',
    fallback: 'Average Fruit Weight',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.yieldPerPlant,
    labelKey: 'yieldPerPlant',
    fallback: 'Yield per Plant',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.yieldPerMeter,
    labelKey: 'yieldPerMeter',
    fallback: 'Yield per Meter',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.qualityPrimary,
    labelKey: 'configQualityPrimary',
    fallback: 'Primary quality %',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.qualitySecondary,
    labelKey: 'configQualitySecondary',
    fallback: 'Secondary quality %',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.criticalAlerts,
    labelKey: 'criticalAlerts',
    fallback: 'Critical Alerts',
    category: 'metrics',
  },
  {
    id: DASHBOARD_METRIC_IDS.daysActive,
    labelKey: 'daysActive',
    fallback: 'Days Active',
    category: 'metrics',
  },
  // Charts
  {
    id: DASHBOARD_CHART_IDS.yieldOverTime,
    labelKey: 'yieldOverTime',
    fallback: 'Yield Over Time',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.yieldPerMeterTrend,
    labelKey: 'yieldPerMeterOverTime',
    fallback: 'Yield per Meter Over Time',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.yieldPerRunningMeterTrend,
    labelKey: 'yieldPerRunningMeterOverTime',
    fallback: 'Yield per Running Meter Over Time',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.classDistribution,
    labelKey: 'classDistribution',
    fallback: 'Class Distribution',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.brixTrend,
    labelKey: 'brixTrendOverTime',
    fallback: 'Brix Trend Over Time',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.fruitWeightTrend,
    labelKey: 'fruitWeightTrendOverTime',
    fallback: 'Fruit Weight Trend Over Time',
    category: 'charts',
  },
  {
    id: DASHBOARD_CHART_IDS.cumulativeYield,
    labelKey: 'cumulativeYieldProgress',
    fallback: 'Cumulative Yield Progress',
    category: 'charts',
  },
];

export const DASHBOARD_ITEM_CATEGORIES: readonly DashboardItemCategory[] = [
  'metrics',
  'charts',
];

/** All known item ids — useful for "select all" / dev-time drift checks. */
export const ALL_DASHBOARD_ITEM_IDS: readonly string[] =
  HARVEST_DASHBOARD_ITEMS.map((item) => item.id);
