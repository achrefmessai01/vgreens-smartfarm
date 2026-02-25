'use client'

import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { Card, CardContent } from '@/components/ui/card'

export interface TrendItem {
  label: string
  data: number[]
}

export interface TrendsCardProps {
  title?: string
  trends: TrendItem[]
  className?: string
}

export function TrendsCard({
  title = 'Trends (7d)',
  trends,
  className,
}: TrendsCardProps) {
  return (
    <Card className={cn('rounded-lg border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 space-y-3">
          {trends.map((t, i) => (
            <div key={i}>
              <div className="text-sm text-muted-foreground">{t.label}</div>
              <div className="mt-2">
                <Sparkline data={t.data} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
