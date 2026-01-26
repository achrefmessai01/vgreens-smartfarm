'use client'

import { useCurrentUser } from './use-current-user'
import { useTenantFeaturesQuery } from '@/generated/graphql'

export function useTenantFeatures() {
  const { user } = useCurrentUser()
  const tenantId = user?.tenantId

  const { data, loading } = useTenantFeaturesQuery({
    variables: { tenantId: tenantId || undefined },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  })

  const enabledFeatures = new Set<string>()

  if (data?.tenantFeatures) {
    data.tenantFeatures.forEach((tf) => {
      if (tf.enabled && tf.feature?.isActive && tf.feature?.key) {
        enabledFeatures.add(tf.feature.key)
      }
    })
  }

  return {
    enabledFeatures,
    loading,
    hasFeature: (featureKey: string) => enabledFeatures.has(featureKey),
  }
}
