import { useCallback, useEffect, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import {
  useCreateHarvestMutation,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import { extractStoragePathFromUrl } from '@/lib/harvest-utils';
import { useHarvestPhotosUpload } from '@/lib/hooks/use-harvest-photos-upload';
import {
  buildCreateEntryInput,
  buildUpdateEntryInput,
} from '@/lib/hooks/use-batch-sheet-inputs';
import type {
  BatchDetailsData,
  BatchSheetMode,
  BrixField,
  YieldField,
} from '@/types/batch-sheet';

interface UseBatchSheetOptions {
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: BatchSheetMode;
  onCompleted?: () => void;
}

export function useBatchSheet({
  harvestId,
  batchData,
  mode = 'create',
  onCompleted,
}: UseBatchSheetOptions) {
  const [localData, setLocalData] = useState<BatchDetailsData | null>(null);
  const [createHarvest, { loading: creating }] = useCreateHarvestMutation();
  const [updateHarvest, { loading: updating }] = useUpdateHarvestMutation();
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();
  const { uploadPhotos, uploading } = useHarvestPhotosUpload(harvestId);

  useEffect(() => {
    setLocalData(batchData);
  }, [batchData]);

  const currentData = localData ?? batchData;

  const handleBrixChange = useCallback((field: BrixField, value: number) => {
    setLocalData((prev) =>
      prev
        ? { ...prev, brixMeasurements: { ...prev.brixMeasurements, [field]: value } }
        : prev,
    );
  }, []);

  const handleYieldChange = useCallback((field: YieldField, value: number) => {
    setLocalData((prev) =>
      prev
        ? { ...prev, todaysHarvest: { ...prev.todaysHarvest, [field]: value } }
        : prev,
    );
  }, []);

  const handlePhotoUpload = useCallback(
    async (assets: ImagePickerAsset[]) => {
      const urls = await uploadPhotos(assets);
      if (urls.length === 0) return;
      setLocalData((prev) =>
        prev ? { ...prev, photos: [...prev.photos, ...urls] } : prev,
      );
    },
    [uploadPhotos],
  );

  const handleRemovePhoto = useCallback(
    async (index: number) => {
      let urlToRemove: string | undefined;
      setLocalData((prev) => {
        if (!prev) return prev;
        urlToRemove = prev.photos[index];
        return { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
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

  const handleSave = useCallback(async () => {
    if (!harvestId || !currentData) return;
    try {
      if (mode === 'create') {
        await createHarvest({
          variables: { input: buildCreateEntryInput(harvestId, currentData) },
        });
      } else {
        await updateHarvest({
          variables: { id: harvestId, input: buildUpdateEntryInput(currentData) },
        });
      }
      onCompleted?.();
    } catch (error) {
      console.error('Failed to save harvest:', error);
    }
  }, [harvestId, currentData, mode, createHarvest, updateHarvest, onCompleted]);

  return {
    currentData,
    loading: creating || updating || uploading,
    uploading,
    mode,
    handleBrixChange,
    handleYieldChange,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  };
}
