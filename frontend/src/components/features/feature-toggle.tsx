'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import type { FeatureWithTenantStatus } from '@/generated/graphql'

interface FeatureToggleProps {
  feature: FeatureWithTenantStatus
  tenantId: string
  onToggle: (featureId: string, enabled: boolean) => void
  isLoading?: boolean
}

export function FeatureToggle({
  feature,
  tenantId,
  onToggle,
  isLoading = false,
}: FeatureToggleProps) {
  const [enabled, setEnabled] = React.useState(
    feature.enabledForTenant || false
  )

  React.useEffect(() => {
    setEnabled(feature.enabledForTenant || false)
  }, [feature.enabledForTenant])

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onToggle(feature.id, checked)
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-primary-foreground/30">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor={`feature-${feature.id}`} className="font-medium">
            {feature.name}
          </Label>
          {feature.category && (
            <Badge variant="outline" className="text-xs">
              {feature.category}
            </Badge>
          )}
          {!feature.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        {feature.description && (
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">Key: {feature.key}</p>
      </div>
      <div className="ml-4">
        <Switch
          id={`feature-${feature.id}`}
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={isLoading || !feature.isActive}
        />
      </div>
    </div>
  )
}
