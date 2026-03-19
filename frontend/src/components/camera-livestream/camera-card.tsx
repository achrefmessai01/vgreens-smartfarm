'use client'

import {
  getCameraStatusColor,
  getCameraStatusVariant,
  formatCameraLastActive,
} from '@/lib/camera-utils'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Camera } from '@/types/camera.types'
import { Video, Circle, Clock, Monitor } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface CameraCardProps {
  camera: Camera
  onClick?: () => void
}

export function CameraCard({ camera, onClick }: CameraCardProps) {
  const [currentTime, setCurrentTime] = React.useState(() => Date.now())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        'bg-gradient-to-br from-card to-card/50 border-2 overflow-hidden',
        onClick && 'hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="p-0 relative">
        <div className="relative w-full aspect-video bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 dark:opacity-5">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-foreground/10 dark:border-white/5"
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2 text-muted-foreground/50 dark:text-white/30">
            <Monitor className="h-12 w-12" />
            <span className="text-xs font-medium">
              {camera.resolution || '1080p'}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <Badge
              variant={getCameraStatusVariant(camera.status)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
            >
              <Circle
                className={cn('h-2 w-2', getCameraStatusColor(camera.status))}
              />
              {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
            </Badge>
          </div>

          {camera.status === 'recording' && (
            <div className="absolute top-3 left-3 z-20">
              <Badge
                variant="destructive"
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold animate-pulse"
              >
                <Video className="h-3 w-3" />
                Recording
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-foreground dark:text-white line-clamp-1">
            {camera.name}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-white/70 mt-0.5">
            {camera.tunnelName} • {camera.location}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-white/60">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatCameraLastActive(camera.lastActive, currentTime)}
            </span>
          </div>
          {camera.fps && <span className="font-medium">{camera.fps} FPS</span>}
        </div>
      </CardContent>
    </Card>
  )
}
