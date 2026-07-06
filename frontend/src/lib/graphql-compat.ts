import type { SystemError, Tenant, User } from '@/generated/graphql';

/**
 * VSL-279 expand phase: the schema still carries the deprecated flat settings
 * fields (`Tenant.disabledSensorFields` / `hiddenHarvestDashboardItems` /
 * `harvestDashboardOrder`) as non-null fields, but our documents no longer
 * select them — everything reads the consolidated `Tenant.settings` /
 * `User.userSettings` objects instead. Query results therefore stop
 * structurally satisfying the raw schema object types, so components that
 * take whole entities are typed against these aliases: the schema types minus
 * the deprecated fields, i.e. exactly what the app actually fetches.
 *
 * The contract phase removes the deprecated fields from the schema, at which
 * point these aliases become identical to the plain types and can be inlined.
 */
export type TenantData = Omit<
  Tenant,
  | 'disabledSensorFields'
  | 'hiddenHarvestDashboardItems'
  | 'harvestDashboardOrder'
>;

export type UserData = Omit<User, 'tenant'> & {
  tenant?: TenantData | null;
};

export type SystemErrorData = Omit<SystemError, 'tenant' | 'user'> & {
  tenant?: TenantData | null;
  user?: UserData | null;
};
