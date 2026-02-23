'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface DashboardFooterProps {
  lastUpdated?: string
  refreshLabel?: string
  onRefresh?: () => void
  className?: string
}

export function DashboardFooter({
  lastUpdated = 'Last updated: 2 minutes ago',
  refreshLabel = 'Refresh',
  onRefresh,
  className,
}: DashboardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm text-muted-foreground',
        className,
      )}
    >
      <div>{lastUpdated}</div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-md"
        onClick={onRefresh}
      >
        {refreshLabel}
      </Button>
    </div>
  )
}
