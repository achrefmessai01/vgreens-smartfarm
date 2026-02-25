'use client'

import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string
  subtitle?: string
  className?: string
}

export function KpiCard({ label, value, subtitle, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 flex flex-col',
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
    </div>
  )
}
