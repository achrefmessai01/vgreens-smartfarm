'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CameraLivestreamFeed } from '@/types/camera.types';
import { AlertCircle, Loader2, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
  const canShowImage = camera.available && imageUrl && !imageFailed;

  React.useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-200',
        canShowImage && onClick && 'hover:border-primary/50 cursor-pointer',
      )}
      onClick={canShowImage ? onClick : undefined}
    >
      <CardHeader className="relative p-0">
        <div className="bg-muted relative flex aspect-video w-full items-center justify-center overflow-hidden">
          {loading ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Connecting to camera</span>
            </div>
          ) : canShowImage ? (
            <img
              src={imageUrl}
              alt={`${camera.name} live camera feed`}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 text-center text-sm">
              <AlertCircle className="h-8 w-8" />
              <span>Camera feed currently unavailable</span>
            </div>
          )}
          {canShowImage && (
            <div className="absolute top-3 left-3">
              <Badge className="gap-1.5 bg-black/70 px-2 py-1 text-[11px] font-semibold tracking-wide text-white uppercase hover:bg-black/70">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Live
              </Badge>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-foreground line-clamp-1 text-base font-semibold">
            {camera.name}
          </h3>
          <Radio
            className={cn(
              'h-4 w-4 shrink-0',
              canShowImage ? 'text-red-500' : 'text-muted-foreground',
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
