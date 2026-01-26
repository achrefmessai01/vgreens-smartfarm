'use client'

import * as React from 'react'
import { FeatureToggle } from './feature-toggle'
import type { FeatureWithTenantStatus } from '@/generated/graphql'

interface FeatureListProps {
  features: FeatureWithTenantStatus[]
  tenantId: string
  onToggle: (featureId: string, enabled: boolean) => void
  isLoading?: boolean
}

export function FeatureList({
  features,
  tenantId,
  onToggle,
  isLoading = false,
}: FeatureListProps) {
  const groupedFeatures = React.useMemo(() => {
    const grouped: Record<string, typeof features> = {}
    features.forEach((feature) => {
      const category = feature.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(feature)
    })
    return grouped
  }, [features])

  if (features.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No features available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">{category}</h3>
          <div className="space-y-2">
            {categoryFeatures.map((feature) => (
              <FeatureToggle
                key={feature.id}
                feature={feature}
                tenantId={tenantId}
                onToggle={onToggle}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
