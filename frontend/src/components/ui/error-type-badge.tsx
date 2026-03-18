'use client'

import { Badge } from '@/components/ui/badge'
import { ErrorType } from '@/generated/graphql'

interface ErrorTypeBadgeProps {
  errorType: ErrorType
  className?: string
}

export function ErrorTypeBadge({ errorType, className }: ErrorTypeBadgeProps) {
  const typeConfig = {
    [ErrorType.ApiError]: {
      label: 'API Error',
      variant: 'destructive' as const,
    },
    [ErrorType.AuthenticationError]: {
      label: 'Auth Error',
      variant: 'destructive' as const,
    },
    [ErrorType.AuthorizationError]: {
      label: 'Access Error',
      variant: 'destructive' as const,
    },
    [ErrorType.BusinessLogicError]: {
      label: 'Logic Error',
      variant: 'secondary' as const,
    },
    [ErrorType.ConfigurationError]: {
      label: 'Config Error',
      variant: 'outline' as const,
    },
    [ErrorType.DatabaseError]: {
      label: 'DB Error',
      variant: 'destructive' as const,
    },
    [ErrorType.ExternalServiceError]: {
      label: 'Service Error',
      variant: 'destructive' as const,
    },
    [ErrorType.MemoryError]: {
      label: 'Memory Error',
      variant: 'destructive' as const,
    },
    [ErrorType.NetworkError]: {
      label: 'Network Error',
      variant: 'destructive' as const,
    },
    [ErrorType.RuntimeError]: {
      label: 'Runtime Error',
      variant: 'destructive' as const,
    },
    [ErrorType.SyntaxError]: {
      label: 'Syntax Error',
      variant: 'destructive' as const,
    },
    [ErrorType.TimeoutError]: {
      label: 'Timeout',
      variant: 'outline' as const,
    },
    [ErrorType.UnknownError]: {
      label: 'Unknown',
      variant: 'secondary' as const,
    },
    [ErrorType.ValidationError]: {
      label: 'Validation',
      variant: 'secondary' as const,
    }
  }

  const config = typeConfig[errorType] || {
    label: 'Unknown',
    variant: 'secondary' as const
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}