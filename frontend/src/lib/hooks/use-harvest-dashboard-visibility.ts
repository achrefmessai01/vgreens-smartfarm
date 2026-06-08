'use client';

import * as React from 'react';
import { useMeQuery } from '@/generated/graphql';
import { useAuth } from '@clerk/nextjs';
import { ALL_DASHBOARD_ITEM_IDS } from '@/components/harvest/dashboard/dashboard-items';

/**
 * Reads the tenant's hidden harvest-dashboard items and exposes a stable
 * `isVisible(id)` predicate. Visibility is stored as the *hidden* set, so any
 * item not explicitly hidden is visible — meaning newly added plots default to
 * visible for tenants that configured their dashboard earlier.
 */
export function useHarvestDashboardVisibility() {
  const { isSignedIn } = useAuth();
  const { data, loading } = useMeQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isSignedIn,
  });

  const tenant = data?.me?.tenant ?? undefined;
  const tenantId = tenant?.id;

  const hiddenSet = React.useMemo(
    () => new Set(tenant?.hiddenHarvestDashboardItems ?? []),
    [tenant?.hiddenHarvestDashboardItems],
  );

  const isVisible = React.useCallback(
    (id: string) => !hiddenSet.has(id),
    [hiddenSet],
  );

  const visibleCount = ALL_DASHBOARD_ITEM_IDS.filter(
    (id) => !hiddenSet.has(id),
  ).length;

  return {
    tenantId,
    hiddenSet,
    isVisible,
    visibleCount,
    /** True when no configurable item is visible (all hidden). */
    allHidden: visibleCount === 0,
    loading,
  };
}
