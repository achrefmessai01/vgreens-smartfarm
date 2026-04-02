'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function HistoryChartSkeleton({ className }: { className?: string }) {
  const width = 600;
  const height = 360;
  const padding = { top: 16, right: 16, bottom: 32, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const cellW = chartWidth / 5;
  const cellH = chartHeight / 4;

  return (
    <div className={cn('flex h-full w-full flex-col', className)} aria-hidden>
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex w-11 shrink-0 flex-col justify-between py-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-3.5 w-8 rounded-sm opacity-90" />
          ))}
        </div>
        <div className="border-border bg-muted/60 min-w-0 flex-1 overflow-hidden rounded-md border">
          <svg
            className="text-muted-foreground/55 block h-full w-full"
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
      <div className="mt-2 flex justify-between gap-1 px-11">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            className="h-3.5 w-12 flex-shrink-0 rounded-sm opacity-90"
          />
        ))}
      </div>
    </div>
  );
}
