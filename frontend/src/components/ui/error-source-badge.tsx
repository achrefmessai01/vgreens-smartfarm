'use client'

import { Badge } from '@/components/ui/badge'
import { ErrorSource } from '@/generated/graphql'

interface ErrorSourceBadgeProps {
  source: ErrorSource
  className?: string
}

export function ErrorSourceBadge({ source, className }: ErrorSourceBadgeProps) {
  const sourceConfig = {
    [ErrorSource.Frontend]: {
      label: 'Frontend',
      variant: 'default' as const,
    },
    [ErrorSource.Backend]: {
      label: 'Backend',
      variant: 'secondary' as const,
    },
    [ErrorSource.Database]: {
      label: 'Database',
      variant: 'destructive' as const,
    },
    [ErrorSource.ExternalApi]: {
      label: 'External API',
      variant: 'outline' as const,
    },
    [ErrorSource.Infrastructure]: {
      label: 'Infrastructure',
      variant: 'secondary' as const,
    }
  }

  const config = sourceConfig[source]

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}