'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export interface MaintenanceItem {
  title: string
  due: string
}

export interface MaintenanceCardProps {
  title?: string
  items: MaintenanceItem[]
  className?: string
}

export function MaintenanceCard({
  title = 'Upcoming Maintenance',
  items,
  className,
}: MaintenanceCardProps) {
  return (
    <Card className={cn('rounded-lg border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item, i) => (
            <li key={i}>
              <div className="font-medium">{item.title}</div>
              <div className="text-muted-foreground text-xs">{item.due}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
