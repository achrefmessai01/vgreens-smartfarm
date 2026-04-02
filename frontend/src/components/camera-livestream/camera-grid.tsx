'use client';

import { CameraCard } from './camera-card';
import type { Camera } from '@/types/camera.types';

interface CameraGridProps {
  cameras: Camera[];
  onCameraClick?: (camera: Camera) => void;
}

export function CameraGrid({ cameras, onCameraClick }: CameraGridProps) {
  if (cameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground text-lg font-semibold dark:text-white/70">
            No cameras found
          </p>
          <p className="text-muted-foreground text-sm dark:text-white/50">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cameras.map((camera) => (
        <CameraCard
          key={camera.id}
          camera={camera}
          onClick={() => onCameraClick?.(camera)}
        />
      ))}
    </div>
  );
}
