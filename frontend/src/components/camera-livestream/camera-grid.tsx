'use client';

import { CameraCard } from './camera-card';
import type { CameraLivestreamFeed } from '@/types/camera.types';

interface CameraGridProps {
  cameras: CameraLivestreamFeed[];
  loading?: boolean;
  refreshToken: number;
  onCameraClick?: (camera: CameraLivestreamFeed) => void;
}

export function withCacheBust(url: string | null | undefined, token: number) {
  if (!url) {
    return null;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${token}`;
}

export function CameraGrid({
  cameras,
  loading = false,
  refreshToken,
  onCameraClick,
}: CameraGridProps) {
  const visibleCameras =
    loading && cameras.length === 0
      ? Array.from({ length: 5 }).map((_, index) => ({
          id: `loading-${index}`,
          name: `Camera ${index + 1}`,
          path: '',
          snapshotUrl: null,
          updatedAt: null,
          expiresAt: null,
          available: false,
          error: null,
        }))
      : cameras;

  if (!loading && cameras.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground text-lg font-semibold dark:text-white/70">
            Camera feeds currently unavailable
          </p>
          <p className="text-muted-foreground text-sm dark:text-white/50">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleCameras.map((camera) => (
        <CameraCard
          key={camera.id}
          camera={camera}
          imageUrl={withCacheBust(camera.snapshotUrl, refreshToken)}
          loading={loading}
          onClick={() => onCameraClick?.(camera)}
        />
      ))}
    </div>
  );
}
