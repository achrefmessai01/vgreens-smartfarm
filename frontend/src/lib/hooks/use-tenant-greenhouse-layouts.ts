'use client';

import * as React from 'react';
import {
  useMeQuery,
  useTenantsQuery,
  UserRole,
} from '@/generated/graphql';
import type { GreenhouseLayout } from '@/lib/sensor-default-positions';

/**
 * Returns the configured greenhouse layouts for a given tenant.
 *
 * Sources the data without any new GraphQL endpoint:
 *   - vGreens admins → the already-loaded `tenants` list (cache-first).
 *   - Tenant users   → their own `me.tenant.greenhouses` (skipped for admins).
 */
export function useTenantGreenhouseLayouts(
  tenantId: string | undefined,
): GreenhouseLayout[] {
  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-first' });
  const role = meData?.me?.role as UserRole | undefined;
  const isVGreensAdmin = role === UserRole.VgreensAdmin;

  const { data: tenantsData } = useTenantsQuery({
    fetchPolicy: 'cache-first',
    skip: !isVGreensAdmin,
  });

  return React.useMemo<GreenhouseLayout[]>(() => {
    if (!tenantId) return [];

    if (isVGreensAdmin) {
      const tenant = tenantsData?.tenants?.find((tn) => tn.id === tenantId);
      return (tenant?.greenhouses ?? []).map((gh) => ({
        name: gh.name,
        xDimension: gh.xDimension,
        yDimension: gh.yDimension,
        bayCount: gh.bayCount ?? null,
      }));
    }

    if (meData?.me?.tenantId === tenantId) {
      return (meData.me.tenant?.greenhouses ?? []).map((gh) => ({
        name: gh.name,
        xDimension: gh.xDimension,
        yDimension: gh.yDimension,
        bayCount: gh.bayCount ?? null,
      }));
    }

    return [];
  }, [tenantId, isVGreensAdmin, tenantsData?.tenants, meData?.me]);
}
