/**
 * Harvest dashboard items that should be HIDDEN by default for every tenant.
 *
 * Visibility is persisted as a *hidden* set on `Tenant.hiddenHarvestDashboardItems`,
 * so any item NOT listed here is visible by default. To ship a metric "off by
 * default" its id must be seeded into the hidden set: for new tenants (in
 * `TenantsService.create`) and, once, for existing tenants via a backfill.
 *
 * Keep these ids in sync with the frontend registry `DASHBOARD_METRIC_IDS`
 * (frontend/src/components/harvest/dashboard/dashboard-items.ts).
 */
export const DEFAULT_HIDDEN_HARVEST_DASHBOARD_ITEMS: readonly string[] = [
  'yieldPerSquareMeter',
];
