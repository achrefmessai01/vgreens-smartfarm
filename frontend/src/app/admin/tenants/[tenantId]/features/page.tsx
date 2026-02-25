'use client'

import {
  useTenantQuery,
  useToggleTenantFeatureMutation,
  useFeaturesWithTenantStatusQuery,
} from '@/generated/graphql'
import * as React from 'react'
import { useI18n } from '@/i18n'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { FeatureList } from '@/components/features'
import { ContentSkeleton } from '@/components/ui/content-skeleton'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { useParams, useRouter } from 'next/navigation'

export default function TenantFeaturesPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId as string

  const { data: tenantData, loading: tenantLoading } = useTenantQuery({
    variables: { id: tenantId },
    skip: !tenantId,
  })

  const {
    data: featuresData,
    loading: featuresLoading,
    refetch: refetchFeatures,
  } = useFeaturesWithTenantStatusQuery({
    variables: { tenantId },
    skip: !tenantId,
  })

  const [toggleFeature] = useToggleTenantFeatureMutation()

  const [isLoading, setIsLoading] = React.useState(false)

  const handleToggle = async (featureId: string, enabled: boolean) => {
    setIsLoading(true)
    try {
      await toggleFeature({
        variables: {
          input: {
            tenantId,
            featureId,
            enabled,
          },
        },
      })
      await refetchFeatures()
    } catch (error) {
      console.error('Error toggling feature:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (tenantLoading || featuresLoading) {
    return (
      <div className="space-y-6">
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={4} rowCount={6} />
      </div>
    )
  }

  const tenant = tenantData?.tenant
  const features = featuresData?.featuresWithTenantStatus || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/tenants')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`${
            t.pages.admin.features.featureAccess || 'Feature Access'
          } - ${tenant?.name || t.pages.admin.tenants.name}`}
          subtitle={
            t.pages.admin.features.manageFeaturesSubtitle ||
            'Manage which features are enabled for this tenant'
          }
        />
      </div>

      <FeatureList
        features={features}
        tenantId={tenantId}
        onToggle={handleToggle}
        isLoading={isLoading}
      />
    </div>
  )
}
