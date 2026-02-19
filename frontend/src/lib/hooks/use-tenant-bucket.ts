'use client'

import { useGetTenantBucketQuery } from '@/generated/graphql'

export function useTenantBucketName(tenantId?: string | null) {
  const { data, loading, error } = useGetTenantBucketQuery({
    variables: { id: tenantId as string },
    skip: !tenantId,
    fetchPolicy: 'cache-and-network',
  })

  const bucketName = data?.tenant?.influxBucketName ?? null

  return {
    bucketName,
    loading,
    error,
  }
}
