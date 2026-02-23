'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface LiveMapCardProps {
  title?: string
  placeholderText?: string
  hintText?: string
  className?: string
}

export function LiveMapCard({
  title = 'Live Map',
  placeholderText = 'Live map placeholder — integrate Leaflet/Mapbox to show zones & sensors',
  hintText = 'Click zones to drill into sensor lists and historical charts.',
  className,
}: LiveMapCardProps) {
  return (
    <Card className={cn('col-span-2 rounded-lg border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 h-48 rounded-md bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-sm text-muted-foreground">
          {placeholderText}
        </div>
        {hintText && (
          <p className="text-xs text-muted-foreground mt-2">{hintText}</p>
        )}
      </CardContent>
    </Card>
  )
}
