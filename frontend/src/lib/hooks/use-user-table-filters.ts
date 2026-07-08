'use client';

import * as React from 'react';
import { UserRole, type Tenant, type User } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import type { FilterConfigOption } from '@/components/ui/data-table';

/**
 * Status filter values for users. Strings (not booleans) so they round-trip
 * cleanly through the multi-select chip serializer used by `DataTable`
 * (`"active,inactive"`).
 */
const STATUS_VALUES = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type UserSortDirection = 'asc' | 'desc';

interface UseUserTableFiltersArgs {
  users: User[];
  /** When provided, exposes a Tenant filter dropdown (admin surface only). */
  tenants?: Tenant[];
  /** Hide the tenant filter when the table itself hides the tenant column. */
  hideTenantColumn?: boolean;
}

/**
 * Local search + filter + sort state for the User Management table.
 * Returns the transformed slice of `users` plus the `FilterConfigOption`s
 * the `DataTable` needs to render filter dropdowns and chips.
 *
 * All filtering + sorting is client-side — the underlying `users` query
 * already returns a fully-scoped list for the current view (own tenant
 * for tenant admin, picked tenant for vGreens admin), so an in-memory pass
 * is the cheapest path and avoids one network round-trip per keystroke.
 *
 * Mirrors `useTenantTableFilters` so the two admin tables behave
 * identically; the name-based sort direction is driven by the clickable
 * USER column header in the redesign.
 */
export function useUserTableFilters({
  users,
  tenants,
  hideTenantColumn = false,
}: UseUserTableFiltersArgs) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [tenantFilter, setTenantFilter] = React.useState('');
  const [sortDirection, setSortDirection] =
    React.useState<UserSortDirection>('asc');

  const toggleSort = React.useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Tenants are only relevant when the table renders the Tenant column.
  const showTenantFilter = !hideTenantColumn && (tenants?.length ?? 0) > 0;

  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const roles = roleFilter ? roleFilter.split(',').filter(Boolean) : [];
    const statuses = statusFilter
      ? statusFilter.split(',').filter(Boolean)
      : [];
    const tenantIds = tenantFilter
      ? tenantFilter.split(',').filter(Boolean)
      : [];

    const filtered = users.filter((user) => {
      if (query) {
        const fullName =
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase();
        const email = (user.email ?? '').toLowerCase();
        if (!fullName.includes(query) && !email.includes(query)) return false;
      }
      if (roles.length && !roles.includes(user.role)) return false;
      if (statuses.length) {
        const isActive = user.isActive ?? true;
        const matchesActive =
          statuses.includes(STATUS_VALUES.active) && isActive;
        const matchesInactive =
          statuses.includes(STATUS_VALUES.inactive) && !isActive;
        if (!matchesActive && !matchesInactive) return false;
      }
      if (tenantIds.length) {
        if (!user.tenantId || !tenantIds.includes(user.tenantId)) return false;
      }
      return true;
    });

    // Sort after filtering so we pay for the collator on the smallest set.
    return [...filtered].sort((a, b) => {
      const av = `${a.firstName ?? ''} ${a.lastName ?? ''}`
        .trim()
        .toLowerCase();
      const bv = `${b.firstName ?? ''} ${b.lastName ?? ''}`
        .trim()
        .toLowerCase();
      const cmp = av.localeCompare(bv);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [users, searchQuery, roleFilter, statusFilter, tenantFilter, sortDirection]);

  const filterConfigs: FilterConfigOption[] = React.useMemo(() => {
    const configs: FilterConfigOption[] = [
      {
        label: t.pages.admin.users.role,
        value: roleFilter,
        multiSelect: true,
        onFilterChange: setRoleFilter,
        options: [
          {
            label: t.pages.admin.users.roleTenantAdmin,
            value: UserRole.TenantAdmin,
          },
          {
            label: t.pages.admin.users.roleTenantUser,
            value: UserRole.TenantUser,
          },
        ],
      },
      {
        label: t.pages.admin.users.status,
        value: statusFilter,
        multiSelect: true,
        onFilterChange: setStatusFilter,
        options: [
          { label: t.pages.admin.users.active, value: STATUS_VALUES.active },
          {
            label: t.pages.admin.users.inactive,
            value: STATUS_VALUES.inactive,
          },
        ],
      },
    ];

    if (showTenantFilter && tenants) {
      configs.push({
        label: t.pages.admin.users.tenant,
        value: tenantFilter,
        multiSelect: true,
        onFilterChange: setTenantFilter,
        options: tenants.map((tenant) => ({
          label: tenant.name,
          value: tenant.id,
        })),
      });
    }

    return configs;
  }, [
    t.pages.admin.users.role,
    t.pages.admin.users.status,
    t.pages.admin.users.tenant,
    t.pages.admin.users.roleTenantAdmin,
    t.pages.admin.users.roleTenantUser,
    t.pages.admin.users.active,
    t.pages.admin.users.inactive,
    roleFilter,
    statusFilter,
    tenantFilter,
    showTenantFilter,
    tenants,
  ]);

  return {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  };
}
