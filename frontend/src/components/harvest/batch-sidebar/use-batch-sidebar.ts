'use client';

import {
  HarvestStatus,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import { computeAvgBrix, extractStoragePathFromUrl } from '@/lib/harvest-utils';
import * as React from 'react';
import { useHarvestPhotosUpload } from '../hooks/use-harvest-photos-upload';
import type { BatchDetailsData } from './batch-sidebar-types';

export type SidebarMode = 'create' | 'edit';

interface UseBatchSidebarOptions {
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  onCompleted?: () => void;
}

export function useBatchSidebar({
  harvestId,
  batchData,
  mode = 'create',
  onCompleted,
}: UseBatchSidebarOptions) {
  const [localData, setLocalData] = React.useState<BatchDetailsData | null>(
    null,
  );
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();
  const { uploadPhotos, uploading } = useHarvestPhotosUpload(harvestId);
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();

  React.useEffect(() => {
    setLocalData(batchData);
  }, [batchData]);

  // Cleanup object URLs on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (localData?.photos) {
        localData.photos.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, []);

  const currentData = localData ?? batchData;

  const handleBrixChange = React.useCallback(
    (field: keyof BatchDetailsData['brixMeasurements'], value: number) => {
      setLocalData((prev) =>
        prev
          ? {
              ...prev,
              brixMeasurements: { ...prev.brixMeasurements, [field]: value },
            }
          : prev,
      );
    },
    [],
  );

  const handleYieldChange = React.useCallback(
    (field: 'marketable' | 'waste', value: number) => {
      setLocalData((prev) =>
        prev
          ? {
              ...prev,
              todaysHarvest: { ...prev.todaysHarvest, [field]: value },
            }
          : prev,
      );
    },
    [],
  );

  const handlePhotoUpload = React.useCallback(
    async (files: File[]) => {
      const uploadedUrls = await uploadPhotos(files);
      if (uploadedUrls.length === 0) return;

      setLocalData((prev) =>
        prev ? { ...prev, photos: [...prev.photos, ...uploadedUrls] } : prev,
      );
    },
    [uploadPhotos],
  );

  const handleRemovePhoto = React.useCallback(
    async (indexToRemove: number) => {
      let urlToRemove: string | undefined;

      setLocalData((prev) => {
        if (!prev) return prev;

        urlToRemove = prev.photos[indexToRemove];

        return {
          ...prev,
          photos: prev.photos.filter((_, index) => index !== indexToRemove),
        };
      });

      if (!urlToRemove) return;

      const path = extractStoragePathFromUrl(urlToRemove);
      if (!path) return;

      try {
        await deleteHarvestImage({ variables: { path } });
      } catch (error) {
        console.error('Failed to delete harvest photo:', error);
      }
    },
    [deleteHarvestImage],
  );

  const handleSave = React.useCallback(async () => {
    if (!harvestId || !currentData) return;
    const brix = currentData.brixMeasurements;
    const status =
      mode === 'edit' ? currentData.status : HarvestStatus.Completed;
    try {
      await updateHarvest({
        variables: {
          id: harvestId,
          input: {
            classA: currentData.todaysHarvest.marketable,
            waste: currentData.todaysHarvest.waste,
            avgBrix: computeAvgBrix(brix),
            ...brix,
            photos: currentData.photos.length,
            photoUrls: currentData.photos,
            date: mode === 'edit' ? undefined : new Date().toISOString(),
            status,
          },
        },
      });
      onCompleted?.();
    } catch (err) {
      console.error('Failed to save harvest:', err);
    }
  }, [harvestId, currentData, mode, updateHarvest, onCompleted]);

  return {
    currentData,
    loading: loading || uploading,
    mode,
    handleBrixChange,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  };
}
