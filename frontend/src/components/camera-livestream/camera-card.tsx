'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CameraLivestreamFeed } from '@/types/camera.types';
import { Loader2, VideoOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface CameraCardProps {
  camera: CameraLivestreamFeed;
  imageUrl: string | null;
  loading?: boolean;
  onClick?: () => void;
}

export function CameraCard({
  camera,
  imageUrl,
  loading = false,
  onClick,
}: CameraCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const canShowImage = camera.available && imageUrl && !imageFailed;
  // Clickable whenever a handler exists: the live stream may be available
  // even when the preview image is not (and vice versa) — the player view
  // handles its own unavailable state.
  const isInteractive = Boolean(onClick) && !loading;

  React.useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Card
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `View ${camera.name} live feed` : undefined}
      className={cn(
        'group relative overflow-hidden p-0 transition-all duration-300',
        isInteractive &&
          'hover:border-primary/50 hover:shadow-primary/10 focus-visible:ring-primary/50 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none',
      )}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="bg-muted relative flex aspect-video w-full items-center justify-center overflow-hidden dark:bg-black/40">
        {loading ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="animate-pulse">Connecting to camera</span>
          </div>
        ) : canShowImage ? (
          <img
            src={imageUrl}
            alt={`${camera.name} live camera feed`}
            className={cn(
              'h-full w-full object-cover transition-all duration-500',
              'group-hover:scale-[1.04]',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2.5 px-4 text-center text-sm">
            <div className="bg-muted-foreground/10 flex h-12 w-12 items-center justify-center rounded-full">
              <VideoOff className="h-6 w-6" />
            </div>
            <span>Camera feed currently unavailable</span>
          </div>
        )}

        {/* Live badge */}
        {canShowImage && (
          <div className="absolute top-3 left-3">
            <Badge className="gap-1.5 border-white/10 bg-black/70 px-2 py-1 text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm hover:bg-black/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live
            </Badge>
          </div>
        )}

        {/* Bottom gradient with camera name */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-3">
          <div className="flex items-center justify-between gap-3 px-4">
            <h3 className="line-clamp-1 text-sm font-semibold text-white drop-shadow-sm">
              {camera.name}
            </h3>
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                canShowImage
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                  : 'bg-white/30',
              )}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
