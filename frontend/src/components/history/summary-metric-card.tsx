'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SummaryMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'primary' | 'success' | 'warning'
  className?: string
}

export function SummaryMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  className,
}: SummaryMetricCardProps) {
  const variantStyles = {
    default: 'bg-card border',
    primary: 'bg-primary text-primary-foreground border-primary',
    success:
      'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    warning:
      'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  }

  const valueStyles = {
    default: 'text-foreground',
    primary: 'text-primary-foreground',
    success: 'text-green-700 dark:text-green-400',
    warning: 'text-orange-700 dark:text-orange-400',
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon
                  className={cn(
                    'h-4 w-4',
                    variant === 'primary'
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground'
                  )}
                />
              )}
              <p
                className={cn(
                  'text-sm font-medium',
                  variant === 'primary'
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {title}
              </p>
            </div>
            <p className={cn('text-3xl font-bold', valueStyles[variant])}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p
                className={cn(
                  'text-xs',
                  variant === 'primary'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                )}
              >
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 pt-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
