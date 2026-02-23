'use client'

import * as React from 'react'
import { TiltCard } from './tilt-card'
import { cn } from '@/lib/utils'

export interface ProgressMetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  progressPercent: number
  progressClassName?: string
  secondaryBar?: { percent: number; label: string }
  secondaryBarClassName?: string
  className?: string
}

export function ProgressMetricCard({
  icon,
  title,
  value,
  subtitle,
  progressPercent,
  progressClassName = 'bg-gradient-to-r from-emerald-400 to-lime-400',
  secondaryBar,
  secondaryBarClassName = 'bg-gradient-to-r from-yellow-400 to-amber-500',
  className,
}: ProgressMetricCardProps) {
  return (
    <TiltCard className={className}>
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {secondaryBar ? (
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-bold">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
            <div className="w-28 shrink-0">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full', secondaryBarClassName)}
                  style={{ width: `${secondaryBar.percent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {secondaryBar.label}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full', progressClassName)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </TiltCard>
  )
}
