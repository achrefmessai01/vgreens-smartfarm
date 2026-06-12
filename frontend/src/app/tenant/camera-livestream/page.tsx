'use client';

import * as React from 'react';
import { useLazyQuery, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { CameraGrid } from '@/components/camera-livestream/camera-grid';
import { CameraLivestreamPlayer } from '@/components/camera-livestream/camera-livestream-player';
import { CameraLivestreamUnavailable } from '@/components/camera-livestream/camera-livestream-unavailable';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  CAMERA_LIVESTREAM_FEEDS_QUERY,
  CAMERA_LIVESTREAM_STREAM_URL_QUERY,
} from '@/graphql/queries/camera-livestream.queries';
import { canAccessCameraLivestream } from '@/lib/camera-livestream-access';
import { resolveLivestreamUrl } from '@/lib/livestream-url';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import type {
  CameraLivestreamFeed,
  CameraLivestreamStream,
} from '@/types/camera.types';

const LIVESTREAM_REFRESH_MS = 5 * 60 * 1000;

interface CameraLivestreamFeedsResult {
  cameraLivestreamFeeds: CameraLivestreamFeed[];
}

interface CameraLivestreamStreamResult {
  cameraLivestreamStreamUrl: CameraLivestreamStream;
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

  const { data, loading, refetch, error } =
    useQuery<CameraLivestreamFeedsResult>(CAMERA_LIVESTREAM_FEEDS_QUERY, {
      skip: userLoading || !featuresDataLoaded || !hasAccess,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    });

  const [
    fetchStreamUrl,
    { data: streamData, loading: streamLoading, error: streamError },
  ] = useLazyQuery<CameraLivestreamStreamResult>(
    CAMERA_LIVESTREAM_STREAM_URL_QUERY,
    { fetchPolicy: 'network-only' },
  );

  const cameras = data?.cameraLivestreamFeeds ?? [];
  const selectedCamera =
    cameras.find((camera) => camera.id === selectedCameraId) ?? null;

  // Refresh preview images every 5 minutes while the grid is visible. The
  // interval is paused while a live stream is open and cleared on unmount.
  React.useEffect(() => {
    if (!hasAccess || selectedCameraId) {
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
  }, [hasAccess, refetch, selectedCameraId]);

  const handleCameraClick = React.useCallback(
    (camera: CameraLivestreamFeed) => {
      setSelectedCameraId(camera.id);
      void fetchStreamUrl({ variables: { cameraId: camera.id } });
    },
    [fetchStreamUrl],
  );

  const handleBack = React.useCallback(() => {
    setSelectedCameraId(null);
  }, []);

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

  if (selectedCamera) {
    const stream =
      streamData?.cameraLivestreamStreamUrl?.cameraId === selectedCamera.id
        ? streamData.cameraLivestreamStreamUrl
        : null;
    const streamUrl = resolveLivestreamUrl(stream?.url);
    const unavailable = Boolean(
      streamError || (stream && (!stream.available || !streamUrl)),
    );

    return (
      <CameraLivestreamPlayer
        cameraName={selectedCamera.name}
        streamUrl={unavailable ? null : streamUrl}
        urlLoading={streamLoading}
        unavailable={unavailable}
        onBack={handleBack}
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
        onCameraClick={handleCameraClick}
      />
    </div>
  );
}
