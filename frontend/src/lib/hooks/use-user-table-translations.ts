'use client';

import { UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';

/**
 * Role → localized label lookup + the shared translation record used by
 * the users list row, grid card, and view empty state. Pulled out so the
 * `UserManagementTable` orchestrator stays under the 150-line budget and
 * so the two consumers (row + grid) can't drift out of sync.
 */
export function useUserTableTranslations() {
  const { t } = useI18n();

  const roleLabels: Record<UserRole, string> = {
    VGREENS_ADMIN: t.pages.admin.users.roleVgreensAdmin,
    VGREENS_MEMBER: t.pages.admin.users.roleVgreensMember,
    TENANT_ADMIN: t.pages.admin.users.roleTenantAdmin,
    TENANT_USER: t.pages.admin.users.roleTenantUser,
  };

  const rowTranslations = {
    active: t.pages.admin.users.active,
    inactive: t.pages.admin.users.inactive,
    pending: t.pages.admin.users.pending,
    edit: t.pages.admin.users.editUser,
    delete: t.pages.admin.users.deleteUser,
    noTenant: t.pages.admin.users.noTenant,
    notAvailable: t.pages.admin.users.notAvailable,
  };

  const gridTranslations = {
    ...rowTranslations,
    noUsers: t.pages.users.noUsers,
    noUsersDescription: t.pages.users.noUsersDescription,
  };

  return { roleLabels, rowTranslations, gridTranslations };
}
