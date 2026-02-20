'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function HistoryChartSkeleton({ className }: { className?: string }) {
  const width = 600
  const height = 360
  const padding = { top: 16, right: 16, bottom: 32, left: 44 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const cellW = chartWidth / 5
  const cellH = chartHeight / 4

  return (
    <div className={cn('h-full w-full flex flex-col', className)} aria-hidden>
      <div className="flex flex-1 min-h-0 gap-3">
        <div className="flex flex-col justify-between py-1 shrink-0 w-11">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-3.5 w-8 rounded-sm opacity-90" />
          ))}
        </div>
        <div className="flex-1 min-w-0 rounded-md overflow-hidden border border-border bg-muted/60">
          <svg
            className="w-full h-full block text-muted-foreground/55"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="history-chart-grid"
                width={cellW}
                height={cellH}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${cellW} 0 L ${cellW} ${cellH} M 0 ${cellH} L ${cellW} ${cellH}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
              </pattern>
            </defs>
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              <rect
                width={chartWidth}
                height={chartHeight}
                fill="url(#history-chart-grid)"
              />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-11 gap-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            className="h-3.5 w-12 rounded-sm flex-shrink-0 opacity-90"
          />
        ))}
      </div>
    </div>
  )
}
