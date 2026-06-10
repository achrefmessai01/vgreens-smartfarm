'use client';

import { VideoOff } from 'lucide-react';
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
      <div className="border-border/60 bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-20">
        <div className="bg-muted-foreground/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <VideoOff className="text-muted-foreground h-7 w-7" />
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-foreground text-lg font-semibold">
            Camera feeds currently unavailable
          </p>
          <p className="text-muted-foreground text-sm">
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
