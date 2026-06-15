'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, Loader2, RotateCcw, VideoOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PlayerStatus = 'connecting' | 'playing' | 'failed';

interface CameraLivestreamPlayerProps {
  cameraName: string;
  /** Absolute HLS playlist URL. Null while loading or when unavailable. */
  streamUrl: string | null;
  /** True while the stream URL is being fetched. */
  urlLoading?: boolean;
  /** True when the backend reported the stream as unavailable. */
  unavailable?: boolean;
  onBack: () => void;
}

/**
 * Full-area live player. The HLS pipeline only exists while this component
 * is mounted: closing the view tears down the hls.js instance, pauses the
 * video and clears its source, so no hidden stream keeps running.
 */
export function CameraLivestreamPlayer({
  cameraName,
  streamUrl,
  urlLoading = false,
  unavailable = false,
  onBack,
}: CameraLivestreamPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = React.useState<PlayerStatus>('connecting');
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      return;
    }

    let disposed = false;
    let hls: { destroy: () => void } | null = null;

    setStatus('connecting');

    const handlePlaying = () => setStatus('playing');
    const handleNativeError = () => setStatus('failed');
    video.addEventListener('playing', handlePlaying);

    const supportsNativeHls = video.canPlayType(
      'application/vnd.apple.mpegurl',
    );

    if (supportsNativeHls) {
      video.addEventListener('error', handleNativeError);
      video.src = streamUrl;
      void video.play().catch(() => {
        // Autoplay can be rejected; the user can press play via controls.
      });
    } else {
      void import('hls.js').then(({ default: Hls }) => {
        if (disposed) {
          return;
        }

        if (!Hls.isSupported()) {
          setStatus('failed');
          return;
        }

        const instance = new Hls({
          enableWorker: true,
          maxBufferLength: 30,
        });
        hls = instance;

        instance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setStatus('failed');
            instance.destroy();
            hls = null;
          }
        });

        instance.loadSource(streamUrl);
        instance.attachMedia(video);
        void video.play().catch(() => {
          // Autoplay can be rejected; the user can press play via controls.
        });
      });
    }

    return () => {
      disposed = true;
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleNativeError);
      hls?.destroy();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [streamUrl, attempt]);

  const showFailure = unavailable || status === 'failed';
  const showConnecting =
    !showFailure && (urlLoading || !streamUrl || status === 'connecting');

  return (
    <div className="flex h-[calc(100dvh-10.5rem)] min-h-[420px] flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            All cameras
          </Button>
          <h2 className="text-foreground line-clamp-1 text-lg font-semibold">
            {cameraName}
          </h2>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Live
        </Badge>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border bg-black">
        <video
          ref={videoRef}
          className={cn(
            'h-full w-full object-contain transition-opacity duration-300',
            status === 'playing' ? 'opacity-100' : 'opacity-0',
          )}
          controls
          autoPlay
          muted
          playsInline
        />

        {showConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
            <Loader2 className="h-9 w-9 animate-spin" />
            <span className="text-sm">Connecting to live stream</span>
          </div>
        )}

        {showFailure && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-white/70">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <VideoOff className="h-7 w-7" />
            </div>
            <span className="text-sm">Live stream currently unavailable</span>
            {!unavailable && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-1 gap-1.5"
                onClick={() => setAttempt((value) => value + 1)}
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
