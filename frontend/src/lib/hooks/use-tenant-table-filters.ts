'use client';

import * as React from 'react';
import type { TenantData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import type { FilterConfigOption } from '@/components/ui/data-table';

/**
 * Status filter values for tenants. Strings (not booleans) so they round-trip
 * cleanly through the multi-select chip serializer used by `DataTable`
 * (`"active,inactive"`) — same shape as `useUserTableFilters`, kept in
 * lock-step so the two tables read the same.
 */
const STATUS_VALUES = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type TenantSortDirection = 'asc' | 'desc';

interface UseTenantTableFiltersArgs {
  tenants: TenantData[];
}

/**
 * Local search + filter + sort state for the Tenant Management table.
 * Returns the transformed slice of `tenants` plus the `FilterConfigOption`s
 * the `DataTable` needs to render its status filter dropdown and chips.
 *
 * All filtering + sorting is client-side — the tenants query already returns
 * a fully-scoped list for the current admin view, so an in-memory pass is
 * the cheapest path and avoids one network round-trip per keystroke. Mirrors
 * `useUserTableFilters` so the two admin tables behave identically; the
 * only extension here is a name-based sort direction driven by the
 * clickable TENANT column header in the redesign.
 */
export function useTenantTableFilters({ tenants }: UseTenantTableFiltersArgs) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sortDirection, setSortDirection] =
    React.useState<TenantSortDirection>('asc');

  const toggleSort = React.useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const filteredTenants = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const statuses = statusFilter
      ? statusFilter.split(',').filter(Boolean)
      : [];

    const filtered = tenants.filter((tenant) => {
      if (query) {
        // Match against every field the row surfaces — name, company, email,
        // phone — so a user typing part of any visible cell finds the row.
        const name = (tenant.name ?? '').toLowerCase();
        const company = (tenant.companyName ?? '').toLowerCase();
        const email = (tenant.email ?? '').toLowerCase();
        const phone = (tenant.phone ?? '').toLowerCase();
        const anyHit =
          name.includes(query) ||
          company.includes(query) ||
          email.includes(query) ||
          phone.includes(query);
        if (!anyHit) return false;
      }
      if (statuses.length) {
        // `isActive` defaults to `true` when unset — treat the row as active
        // in that case so we don't hide legitimate tenants from the default
        // "Active" filter.
        const isActive = tenant.isActive ?? true;
        const matchesActive =
          statuses.includes(STATUS_VALUES.active) && isActive;
        const matchesInactive =
          statuses.includes(STATUS_VALUES.inactive) && !isActive;
        if (!matchesActive && !matchesInactive) return false;
      }
      return true;
    });

    // Sort last so search + filter both narrow the set before we pay for
    // the collator. Copy first — `filter` returns a new array but we
    // shouldn't rely on that as a mutation surface.
    return [...filtered].sort((a, b) => {
      const av = (a.name ?? '').toLowerCase();
      const bv = (b.name ?? '').toLowerCase();
      const cmp = av.localeCompare(bv);
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [tenants, searchQuery, statusFilter, sortDirection]);

  const filterConfigs: FilterConfigOption[] = React.useMemo(
    () => [
      {
        label: t.pages.admin.tenants.status,
        value: statusFilter,
        multiSelect: true,
        onFilterChange: setStatusFilter,
        options: [
          {
            label: t.pages.admin.tenants.active,
            value: STATUS_VALUES.active,
          },
          {
            label: t.pages.admin.tenants.inactive,
            value: STATUS_VALUES.inactive,
          },
        ],
      },
    ],
    [
      t.pages.admin.tenants.status,
      t.pages.admin.tenants.active,
      t.pages.admin.tenants.inactive,
      statusFilter,
    ],
  );

  return {
    filteredTenants,
    searchQuery,
    setSearchQuery,
    filterConfigs,
    sortDirection,
    toggleSort,
  };
}
