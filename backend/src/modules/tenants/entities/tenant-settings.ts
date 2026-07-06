import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Consolidated per-tenant settings, stored in the `tenants.settings` jsonb
 * column (VSL-279 expand-contract). Canonical home for what used to live in
 * the dedicated `disabledSensorFields` / `hiddenHarvestDashboardItems` /
 * `harvestDashboardOrder` columns — those columns are dual-written during the
 * expand phase and dropped by a later contract migration.
 *
 * Deliberately NOT included:
 *   - `allowedDomains`: access-control config enforced by the users service,
 *     not a display preference — stays a first-class column.
 *   - `timezone` / `influxBucketName`: infrastructure fields, not settings.
 */
@ObjectType()
export class TenantSettings {
  @Field(() => [String])
  disabledSensorFields: string[];

  @Field(() => [String])
  hiddenHarvestDashboardItems: string[];

  @Field(() => [String])
  harvestDashboardOrder: string[];
}

/** The subset of Tenant the composer needs (avoids a circular entity import). */
export interface TenantSettingsSource {
  settings?: Partial<TenantSettings> | null;
  disabledSensorFields?: string[] | null;
  hiddenHarvestDashboardItems?: string[] | null;
  harvestDashboardOrder?: string[] | null;
}

/**
 * Compose a complete TenantSettings object from a tenant row. Reads the jsonb
 * blob first and falls back per-key to the deprecated flat columns, so rows
 * that pre-date the backfill (or a `{}` default on a fresh row) still resolve
 * every key. Always returns arrays — the GraphQL fields are non-null.
 */
export function composeTenantSettings(
  source: TenantSettingsSource,
): TenantSettings {
  const blob = source.settings ?? {};
  return {
    disabledSensorFields:
      blob.disabledSensorFields ?? source.disabledSensorFields ?? [],
    hiddenHarvestDashboardItems:
      blob.hiddenHarvestDashboardItems ??
      source.hiddenHarvestDashboardItems ??
      [],
    harvestDashboardOrder:
      blob.harvestDashboardOrder ?? source.harvestDashboardOrder ?? [],
  };
}
