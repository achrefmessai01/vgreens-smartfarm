import { useCallback, useEffect, useState } from 'react';
import {
  HarvestStatus,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import { computeAvgBrix, extractStoragePathFromUrl } from '@/lib/harvest-utils';
import type {
  BatchDetailsData,
  BatchSheetMode,
  BrixField,
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
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();

  useEffect(() => {
    setLocalData(batchData);
  }, [batchData]);

  const currentData = localData ?? batchData;

  const handleBrixChange = useCallback((field: BrixField, value: number) => {
    setLocalData((prev) =>
      prev
        ? {
            ...prev,
            brixMeasurements: { ...prev.brixMeasurements, [field]: value },
          }
        : prev,
    );
  }, []);

  const handleYieldChange = useCallback(
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

  const handleRemovePhoto = useCallback(
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

  const handleSave = useCallback(async () => {
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
    } catch (error) {
      console.error('Failed to save harvest:', error);
    }
  }, [harvestId, currentData, mode, updateHarvest, onCompleted]);

  return {
    currentData,
    loading,
    mode,
    handleBrixChange,
    handleYieldChange,
    handleRemovePhoto,
    handleSave,
  };
}
