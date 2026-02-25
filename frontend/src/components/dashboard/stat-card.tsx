'use client'

import * as React from 'react'
import { TiltCard } from './tilt-card'

export interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle?: string
  className?: string
}

export function StatCard({
  icon,
  title,
  value,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <TiltCard className={className}>
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-2xl font-bold mt-3">{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      )}
    </TiltCard>
  )
}
