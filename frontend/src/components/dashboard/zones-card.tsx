'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/i18n'

export interface ZoneItem {
  name: string
  percent: number
  barClassName?: string
}

export interface ZonesCardProps {
  title?: string
  zones: ZoneItem[]
  className?: string
}

export function ZonesCard({
  title,
  zones,
  className,
}: ZonesCardProps) {
  const {t} = useI18n();

  title = title ?? t.pages.admin.dashboard.topPerformingZonesComponentTitle;
  return (
    <Card className={cn('rounded-lg border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 space-y-3 text-sm">
          {zones.map((z, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span>{z.name}</span>
                <span>{z.percent}%</span>
              </div>
              <div className="h-2 bg-muted rounded mt-1 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded bg-emerald-400',
                    z.barClassName,
                  )}
                  style={{ width: `${z.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
