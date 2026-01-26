'use client'

import * as React from 'react'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ComingSoonCard } from '@/components/ui/coming-soon-card'
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features'

interface FeatureGuardProps {
  featureKey: string
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function FeatureGuard({
  featureKey,
  children,
  fallback,
  redirectTo,
}: FeatureGuardProps) {
  const { hasFeature, loading } = useTenantFeatures()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !hasFeature(featureKey) && redirectTo) {
      router.push(redirectTo)
    }
  }, [loading, hasFeature, featureKey, redirectTo, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!hasFeature(featureKey)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <ComingSoonCard
        icon={Lock}
        title="Feature Not Available"
        description="This feature is not enabled for your tenant. Please contact your administrator."
      />
    )
  }

  return <>{children}</>
}
