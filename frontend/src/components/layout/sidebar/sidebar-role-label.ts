import { UserRole } from '@/generated/graphql';
import type { Translations } from '@/i18n/translations';

/**
 * Resolve a display-friendly, localized label for a role. Falls back to
 * English copy when a locale hasn't shipped the sidebar strings yet so the
 * badge never renders empty.
 */
export function getRoleLabel(
  role: UserRole | undefined | null,
  t: Translations,
): string {
  const sidebar = (t.common as unknown as {
    sidebar?: Partial<{
      roleVGreensAdmin: string;
      roleVGreensMember: string;
      roleTenantAdmin: string;
      roleTenantUser: string;
    }>;
  }).sidebar;

  switch (role) {
    case UserRole.VgreensAdmin:
      return sidebar?.roleVGreensAdmin ?? 'VGreens Admin';
    case UserRole.VgreensMember:
      return sidebar?.roleVGreensMember ?? 'VGreens Member';
    case UserRole.TenantAdmin:
      return sidebar?.roleTenantAdmin ?? 'Tenant Admin';
    case UserRole.TenantUser:
      return sidebar?.roleTenantUser ?? 'Tenant User';
    default:
      return t.common.user ?? 'User';
  }
}
