'use client';

import {
  HarvestStatus,
  HarvestsDocument,
  useCreateHarvestMutation,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { useHarvestPhotosUpload } from '@/lib/hooks/use-harvest-photos-upload';
import { computeAvgBrix, extractStoragePathFromUrl } from '@/lib/harvest-utils';
import * as React from 'react';

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
  const [showBrix, setShowBrix] = React.useState(false);
  const [createHarvest, { loading: createLoading }] =
    useCreateHarvestMutation();
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();
  const { uploadPhotos, uploading } = useHarvestPhotosUpload(harvestId);
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();

  React.useEffect(() => {
    setLocalData(batchData);
    // In edit mode, expand the brix section automatically when the batch
    // already has readings — otherwise existing values would appear lost.
    setShowBrix(
      mode === 'edit' && (batchData?.brixReadings?.some((v) => v > 0) ?? false),
    );
  }, [batchData, mode]);

  React.useEffect(() => {
    const photos = localData?.photos ?? [];
    return () => {
      photos.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [localData?.photos]);

  const currentData = localData ?? batchData;

  const handleBrixChange = React.useCallback((index: number, value: number) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      const next = [...prev.brixReadings];
      next[index] = value;
      return { ...prev, brixReadings: next };
    });
  }, []);

  const handleAddBrixReading = React.useCallback(() => {
    setLocalData((prev) =>
      prev ? { ...prev, brixReadings: [...prev.brixReadings, 0] } : prev,
    );
  }, []);

  const handleRemoveBrixReading = React.useCallback((index: number) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      if (prev.brixReadings.length <= 1) return prev;
      return {
        ...prev,
        brixReadings: prev.brixReadings.filter((_, i) => i !== index),
      };
    });
  }, []);

  const handleYieldChange = React.useCallback(
    (field: 'marketable' | 'waste' | 'rowX' | 'rowY', value: number) => {
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
          photos: prev.photos.filter((_, i) => i !== indexToRemove),
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
    const brixReadings = showBrix ? currentData.brixReadings : [];
    const avgBrix = computeAvgBrix(brixReadings);
    // Re-fetch the harvest list after every save so the entry tab updates
    // immediately. awaitRefetchQueries makes the mutation promise resolve only
    // after the refetch lands, so onCompleted fires against fresh data.
    const refetchOptions = {
      refetchQueries: [{ query: HarvestsDocument }],
      awaitRefetchQueries: true,
    };
    try {
      if (mode === 'create') {
        await createHarvest({
          variables: {
            input: {
              parentBatchId: harvestId,
              species: currentData.species,
              variety: currentData.variety,
              batch: currentData.name,
              greenhouse:
                currentData.greenhouse.id || currentData.greenhouse.name,
              plantingDate: currentData.plantingDate,
              cultivationArea: currentData.area,
              numberOfRows: currentData.numberOfRows,
              rowLength: currentData.rowLength,
              plantsPerMeter: currentData.plantsPerMeter,
              rowSpacing: currentData.rowSpacing,
              classA: currentData.todaysHarvest.marketable,
              waste: currentData.todaysHarvest.waste,
              avgBrix,
              rowX: currentData.todaysHarvest.rowX,
              rowY: currentData.todaysHarvest.rowY,
              brixReadings,
              photos: currentData.photos.length,
              photoUrls: currentData.photos,
              date: new Date().toISOString(),
              status: HarvestStatus.Completed,
            },
          },
          ...refetchOptions,
        });
      } else {
        await updateHarvest({
          variables: {
            id: harvestId,
            input: {
              classA: currentData.todaysHarvest.marketable,
              waste: currentData.todaysHarvest.waste,
              avgBrix,
              rowX: currentData.todaysHarvest.rowX,
              rowY: currentData.todaysHarvest.rowY,
              brixReadings,
              photos: currentData.photos.length,
              photoUrls: currentData.photos,
              status: currentData.status,
            },
          },
          ...refetchOptions,
        });
      }
      onCompleted?.();
    } catch (err) {
      console.error('Failed to save harvest:', err);
    }
  }, [
    harvestId,
    currentData,
    mode,
    showBrix,
    updateHarvest,
    createHarvest,
    onCompleted,
  ]);

  return {
    currentData,
    loading: loading || createLoading || uploading,
    mode,
    showBrix,
    setShowBrix,
    handleBrixChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  };
}
