'use client'

import * as React from 'react'
import { TiltCard } from './tilt-card'
import { Sparkline } from './sparkline'

export interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  sparklineData?: number[]
  className?: string
}

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  sparklineData,
  className,
}: MetricCardProps) {
  return (
    <TiltCard className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="ml-4">
            <Sparkline data={sparklineData} />
          </div>
        )}
      </div>
    </TiltCard>
  )
}
