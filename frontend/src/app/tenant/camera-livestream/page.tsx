'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Radio } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import {
  CameraGrid,
  withCacheBust,
} from '@/components/camera-livestream/camera-grid';
import { CameraLivestreamUnavailable } from '@/components/camera-livestream/camera-livestream-unavailable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Badge } from '@/components/ui/badge';
import { CAMERA_LIVESTREAM_FEEDS_QUERY } from '@/graphql/queries/camera-livestream.queries';
import { canAccessCameraLivestream } from '@/lib/camera-livestream-access';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import type { CameraLivestreamFeed } from '@/types/camera.types';

const LIVESTREAM_REFRESH_MS = 5 * 60 * 1000;

interface CameraLivestreamFeedsResult {
  cameraLivestreamFeeds: CameraLivestreamFeed[];
}

export default function CameraLivestreamPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading: userLoading } = useCurrentUser();
  const {
    enabledFeatures,
    loading: featuresLoading,
    dataLoaded: featuresDataLoaded,
  } = useTenantFeatures();
  const hasAccess = canAccessCameraLivestream({
    user,
    enabledFeatures,
    includeInternalAdmins: true,
  });
  const [refreshToken, setRefreshToken] = React.useState(() => Date.now());
  const [selectedCameraId, setSelectedCameraId] = React.useState<string | null>(
    null,
  );
  const [modalImageFailed, setModalImageFailed] = React.useState(false);

  const { data, loading, refetch, error } =
    useQuery<CameraLivestreamFeedsResult>(CAMERA_LIVESTREAM_FEEDS_QUERY, {
      skip: userLoading || !featuresDataLoaded || !hasAccess,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    });

  const cameras = data?.cameraLivestreamFeeds ?? [];
  const selectedCamera =
    cameras.find((camera) => camera.id === selectedCameraId) ?? null;

  React.useEffect(() => {
    if (!hasAccess) {
      return;
    }

    const refreshLivestreamFeeds = () => {
      setRefreshToken(Date.now());
      void refetch();
    };

    const intervalId = window.setInterval(
      refreshLivestreamFeeds,
      LIVESTREAM_REFRESH_MS,
    );

    return () => window.clearInterval(intervalId);
  }, [hasAccess, refetch]);

  React.useEffect(() => {
    setModalImageFailed(false);
  }, [selectedCamera?.snapshotUrl, refreshToken]);

  if (userLoading || (!hasAccess && (featuresLoading || !featuresDataLoaded))) {
    return <PageSkeleton />;
  }

  if (!hasAccess || error) {
    return (
      <CameraLivestreamUnavailable
        onRedirect={() => router.push('/tenant/farm-overview')}
        redirectLabel="Go to Farm Overview"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t.pages.cameraLivestream.title}
          subtitle={t.pages.cameraLivestream.subtitle}
          className="mb-0"
        />
        <Badge
          variant="secondary"
          className="w-fit gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Live
        </Badge>
      </div>

      <CameraGrid
        cameras={cameras}
        loading={loading && cameras.length === 0}
        refreshToken={refreshToken}
        onCameraClick={(camera) => setSelectedCameraId(camera.id)}
      />

      <Dialog
        open={Boolean(selectedCamera)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCameraId(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
          {selectedCamera && (
            <div className="flex max-h-[90vh] flex-col">
              <DialogHeader className="border-b px-6 py-4">
                <div className="flex items-center justify-between gap-4 pr-8">
                  <div>
                    <DialogTitle>{selectedCamera.name}</DialogTitle>
                    <DialogDescription>Live camera feed</DialogDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    Live
                  </Badge>
                </div>
              </DialogHeader>
              <div className="flex min-h-[320px] items-center justify-center bg-black/95 p-2 sm:p-4">
                {selectedCamera.available && selectedCamera.snapshotUrl ? (
                  modalImageFailed ? (
                    <div className="flex flex-col items-center gap-2.5 px-4 text-center text-sm text-white/60">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Radio className="h-6 w-6" />
                      </div>
                      Camera feed currently unavailable
                    </div>
                  ) : (
                    <img
                      src={
                        withCacheBust(
                          selectedCamera.snapshotUrl,
                          refreshToken,
                        ) ?? undefined
                      }
                      alt={`${selectedCamera.name} live camera feed`}
                      className="max-h-[70vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
                      onError={() => setModalImageFailed(true)}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2.5 px-4 text-center text-sm text-white/60">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <Radio className="h-6 w-6" />
                    </div>
                    Camera feed currently unavailable
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
