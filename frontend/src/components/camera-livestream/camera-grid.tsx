'use client'

import { CameraCard } from './camera-card'
import type { Camera } from '@/types/camera.types'

interface CameraGridProps {
  cameras: Camera[]
  onCameraClick?: (camera: Camera) => void
}

export function CameraGrid({ cameras, onCameraClick }: CameraGridProps) {
  if (cameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-muted-foreground dark:text-white/70">
            No cameras found
          </p>
          <p className="text-sm text-muted-foreground dark:text-white/50">
            Try adjusting your filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cameras.map((camera) => (
        <CameraCard
          key={camera.id}
          camera={camera}
          onClick={() => onCameraClick?.(camera)}
        />
      ))}
    </div>
  )
}
