'use client';

import * as React from 'react';
import { useMeQuery, useTenantsQuery, UserRole } from '@/generated/graphql';
import { useAuth } from '@clerk/nextjs';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';

/**
 * Reorders an `{ id }`-keyed list to match a saved order. Items whose id is not
 * in `order` keep their incoming (registry) position, sorted after the ordered
 * ones — so newly added items surface at the end without a migration. Stable.
 */
export function applyDashboardOrder<T extends { id: string }>(
  items: T[],
  order: readonly string[],
): T[] {
  const rank = new Map(order.map((id, i) => [id, i]));
  const fallback = order.length;
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => {
      const ra = rank.get(a.item.id) ?? fallback;
      const rb = rank.get(b.item.id) ?? fallback;
      return ra === rb ? a.i - b.i : ra - rb;
    })
    .map(({ item }) => item);
}

/**
 * Given the full ordered id list of a grid and a new ordering of just its
 * *visible* ids, produce the new full order with hidden ids pinned to their
 * original slots. dnd only reorders visible items, so each visible slot (index)
 * is preserved and simply receives the next id from `newVisibleOrder`.
 */
export function mergeVisibleOrder(
  fullOrder: string[],
  newVisibleOrder: string[],
  isVisible: (id: string) => boolean,
): string[] {
  const result = [...fullOrder];
  let v = 0;
  for (let i = 0; i < result.length; i++) {
    if (isVisible(result[i])) {
      result[i] = newVisibleOrder[v++];
    }
  }
  return result;
}

/**
 * Reads the tenant's saved harvest-dashboard item order. The stored value is a
 * flat list of item ids (metrics + charts share one list); each grid filters to
 * its own ids, so cross-category interleaving is irrelevant. Empty = no custom
 * order, so grids fall back to their registry order.
 *
 * For VGreens admins, uses the selected tenant from navbar context.
 * For tenant users, uses their own tenant.
 */
export function useHarvestDashboardOrder() {
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

  const order = React.useMemo<string[]>(
    () => tenant?.settings?.harvestDashboardOrder ?? [],
    [tenant?.settings?.harvestDashboardOrder],
  );

  const applyOrder = React.useCallback(
    <T extends { id: string }>(items: T[]) => applyDashboardOrder(items, order),
    [order],
  );

  return {
    tenantId,
    order,
    applyOrder,
    loading: meLoading || (isVGreensAdmin && tenantsLoading),
  };
}
