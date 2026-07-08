'use client';

import * as React from 'react';
import { useMeQuery, useTenantsQuery, UserRole } from '@/generated/graphql';
import { useAuth } from '@clerk/nextjs';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { ALL_DASHBOARD_ITEM_IDS } from '@/components/harvest/dashboard/dashboard-items';

/**
 * Reads the tenant's hidden harvest-dashboard items and exposes a stable
 * `isVisible(id)` predicate. Visibility is stored as the *hidden* set, so any
 * item not explicitly hidden is visible — meaning newly added plots default to
 * visible for tenants that configured their dashboard earlier.
 * 
 * For VGreens admins, uses the selected tenant from navbar context.
 * For tenant users, uses their own tenant.
 */
export function useHarvestDashboardVisibility() {
  const { isSignedIn } = useAuth();
  const { data: meData, loading: meLoading } = useMeQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isSignedIn,
  });

  const role = meData?.me?.role as UserRole | undefined;
  const isVGreensAdmin = role === UserRole.VgreensAdmin;

  const { data: tenantsData, loading: tenantsLoading } = useTenantsQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isVGreensAdmin,
  });

  const selectedTenantId = useTenantIdVariable();
  const userTenantId = meData?.me?.tenant?.id;
  const tenantId = selectedTenantId ?? userTenantId;

  const tenant = React.useMemo(() => {
    if (!tenantId) return undefined;
    
    if (isVGreensAdmin) {
      return tenantsData?.tenants?.find((t) => t.id === tenantId);
    }
    
    return meData?.me?.tenant ?? undefined;
  }, [tenantId, isVGreensAdmin, tenantsData?.tenants, meData?.me?.tenant]);

  const hiddenSet = React.useMemo(
    () => new Set(tenant?.settings?.hiddenHarvestDashboardItems ?? []),
    [tenant?.settings?.hiddenHarvestDashboardItems],
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
    loading: meLoading || (isVGreensAdmin && tenantsLoading),
  };
}
