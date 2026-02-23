'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface StatusDot {
  label: string
  variant?: 'success' | 'warning' | 'muted'
}

export interface SyncStatusBarProps {
  statusDots?: StatusDot[]
  exportCsvLabel?: string
  exportPdfLabel?: string
  onExportCsv?: () => void
  onExportPdf?: () => void
  className?: string
}

const dotClass = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  muted: 'bg-muted-foreground',
}

export function SyncStatusBar({
  statusDots = [],
  exportCsvLabel = 'Export CSV',
  exportPdfLabel = 'Export PDF',
  onExportCsv,
  onExportPdf,
  className,
}: SyncStatusBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 flex-wrap',
        className,
      )}
    >
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {statusDots.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                dotClass[d.variant ?? 'muted'],
              )}
            />
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-md"
          onClick={onExportCsv}
        >
          {exportCsvLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-md"
          onClick={onExportPdf}
        >
          {exportPdfLabel}
        </Button>
      </div>
    </div>
  )
}
