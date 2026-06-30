'use client';

import { useCurrentUser } from './use-current-user';
import { useTenantFeaturesQuery } from '@/generated/graphql';

/**
 * Returns the set of features enabled for a tenant.
 *
 * By default it looks up the current user's tenant. Pass `tenantIdOverride`
 * to look up features for an arbitrary tenant — used by VGREENS_ADMIN who
 * has selected a tenant in the navbar selector and wants to see exactly
 * what that tenant has enabled (e.g. for the in-header `TenantNavbar`).
 *
 * The backend `tenantFeatures` resolver runs `resolveTenantId` and only
 * honours the override for admins; for regular users an override is
 * silently coerced back to their own tenant id, so callers can pass the
 * value unconditionally without worrying about leakage.
 */
export function useTenantFeatures(tenantIdOverride?: string) {
  const { user } = useCurrentUser();
  const tenantId = tenantIdOverride ?? user?.tenantId;

  const { data, loading } = useTenantFeaturesQuery({
    variables: { tenantId: tenantId || undefined },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  });

  const enabledFeatures = new Set<string>();

  if (data?.tenantFeatures) {
    data.tenantFeatures.forEach((tf) => {
      if (tf.enabled && tf.feature?.isActive && tf.feature?.key) {
        enabledFeatures.add(tf.feature.key);
      }
    });
  }

  const dataLoaded = Boolean(tenantId) && !loading && data !== undefined;

  return {
    enabledFeatures,
    loading,
    dataLoaded,
    hasFeature: (featureKey: string) => enabledFeatures.has(featureKey),
  };
}
