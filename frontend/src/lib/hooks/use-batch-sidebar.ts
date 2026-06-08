'use client';

import {
  HarvestStatus,
  HarvestQualityClass,
  HarvestsDocument,
  useCreateHarvestMutation,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import type {
  BatchDetailsData,
  HarvestEntryData,
} from '@/types/batch-sidebar.types';
import { createEmptyEntry } from '@/types/batch-sidebar.types';
import { useHarvestPhotosUpload } from '@/lib/hooks/use-harvest-photos-upload';
import {
  computeAvgBrix,
  computeAvgFruitWeight,
  extractStoragePathFromUrl,
} from '@/lib/harvest-utils';
import * as React from 'react';

export type SidebarMode = 'create' | 'edit';

interface UseBatchSidebarOptions {
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  initialDate?: string | null;
  onCompleted?: () => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function toIsoDateInput(value: string | null | undefined): string {
  if (!value) return todayIsoDate();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return todayIsoDate();
  return parsed.toISOString().split('T')[0];
}

export function useBatchSidebar({
  harvestId,
  batchData,
  mode = 'create',
  initialDate,
  onCompleted,
}: UseBatchSidebarOptions) {
  const [localData, setLocalData] = React.useState<BatchDetailsData | null>(
    null,
  );
  const [harvestDate, setHarvestDate] = React.useState<string>(todayIsoDate);
  const [createHarvest, { loading: createLoading }] =
    useCreateHarvestMutation();
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();
  const { uploadPhotos, uploading } = useHarvestPhotosUpload(harvestId);
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();

  React.useEffect(() => {
    setLocalData(batchData);
    setHarvestDate(
      mode === 'edit' ? toIsoDateInput(initialDate) : todayIsoDate(),
    );
  }, [batchData, mode, initialDate]);

  // Update one entry in place via an updater function.
  const updateEntry = React.useCallback(
    (
      entryIndex: number,
      updater: (entry: HarvestEntryData) => HarvestEntryData,
    ) => {
      setLocalData((prev) => {
        if (!prev) return prev;
        const entries = prev.entries.map((entry, i) =>
          i === entryIndex ? updater(entry) : entry,
        );
        return { ...prev, entries };
      });
    },
    [],
  );

  React.useEffect(() => {
    const photos = localData?.photos ?? [];
    return () => {
      photos.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [localData?.photos]);

  const currentData = localData ?? batchData;

  const handleBrixChange = React.useCallback(
    (entryIndex: number, readingIndex: number, value: number) => {
      updateEntry(entryIndex, (entry) => {
        const brixReadings = [...entry.brixReadings];
        brixReadings[readingIndex] = value;
        return { ...entry, brixReadings };
      });
    },
    [updateEntry],
  );

  // Each reading carries a quality grade at the same index; add/remove keep the
  // two arrays aligned and new readings default to Quality A.
  const handleBrixClassChange = React.useCallback(
    (entryIndex: number, readingIndex: number, value: HarvestQualityClass) => {
      updateEntry(entryIndex, (entry) => {
        const brixClasses = [...entry.brixClasses];
        brixClasses[readingIndex] = value;
        return { ...entry, brixClasses };
      });
    },
    [updateEntry],
  );

  const handleAddBrixReading = React.useCallback(
    (entryIndex: number) => {
      updateEntry(entryIndex, (entry) => ({
        ...entry,
        brixReadings: [...entry.brixReadings, 0],
        brixClasses: [...entry.brixClasses, HarvestQualityClass.A],
      }));
    },
    [updateEntry],
  );

  const handleRemoveBrixReading = React.useCallback(
    (entryIndex: number, readingIndex: number) => {
      updateEntry(entryIndex, (entry) => {
        if (entry.brixReadings.length <= 1) return entry;
        return {
          ...entry,
          brixReadings: entry.brixReadings.filter((_, i) => i !== readingIndex),
          brixClasses: entry.brixClasses.filter((_, i) => i !== readingIndex),
        };
      });
    },
    [updateEntry],
  );

  const handleFruitCountChange = React.useCallback(
    (entryIndex: number, value: number) => {
      updateEntry(entryIndex, (entry) => ({ ...entry, fruitCount: value }));
    },
    [updateEntry],
  );

  const handleYieldChange = React.useCallback(
    (
      entryIndex: number,
      field: 'marketable' | 'waste' | 'classB' | 'classC' | 'rowX' | 'rowY',
      value: number,
    ) => {
      updateEntry(entryIndex, (entry) => ({ ...entry, [field]: value }));
    },
    [updateEntry],
  );

  const handleSetShowBrix = React.useCallback(
    (entryIndex: number, show: boolean) => {
      updateEntry(entryIndex, (entry) => ({ ...entry, showBrix: show }));
    },
    [updateEntry],
  );

  const handleSetShowFruitWeight = React.useCallback(
    (entryIndex: number, show: boolean) => {
      updateEntry(entryIndex, (entry) => ({ ...entry, showFruitWeight: show }));
    },
    [updateEntry],
  );

  const handleAddEntry = React.useCallback(() => {
    setLocalData((prev) =>
      prev ? { ...prev, entries: [...prev.entries, createEmptyEntry()] } : prev,
    );
  }, []);

  const handleRemoveEntry = React.useCallback((entryIndex: number) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      // At least one entry must always remain.
      if (prev.entries.length <= 1) return prev;
      return {
        ...prev,
        entries: prev.entries.filter((_, i) => i !== entryIndex),
      };
    });
  }, []);

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
    // Map each sub-entry to the GraphQL input shape. Brix readings and fruit
    // count only count when their section is expanded; total fruit weight is
    // the entry's sellable yield (Class A + Class B + Class C). The backend
    // re-derives the top-level aggregates from these entries.
    const entries = currentData.entries.map((entry) => {
      const brixReadings = entry.showBrix ? entry.brixReadings : [];
      // Keep grades index-aligned with the readings actually sent.
      const brixClasses = entry.showBrix ? entry.brixClasses : [];
      const fruitCount = entry.showFruitWeight ? entry.fruitCount : 0;
      const totalFruitWeight = entry.showFruitWeight
        ? (entry.marketable || 0) + (entry.classB || 0) + (entry.classC || 0)
        : 0;
      return {
        classA: entry.marketable,
        classB: entry.classB,
        classC: entry.classC,
        waste: entry.waste,
        rowX: entry.rowX,
        rowY: entry.rowY,
        avgBrix: computeAvgBrix(brixReadings),
        brixReadings,
        brixClasses,
        fruitCount,
        totalFruitWeight,
        avgFruitWeight: computeAvgFruitWeight(fruitCount, totalFruitWeight),
      };
    });
    // Re-fetch the harvest list after every save so the entry tab updates
    // immediately. awaitRefetchQueries makes the mutation promise resolve only
    // after the refetch lands, so onCompleted fires against fresh data.
    const refetchOptions = {
      refetchQueries: [{ query: HarvestsDocument }],
      awaitRefetchQueries: true,
    };
    const isoDate = new Date(harvestDate).toISOString();
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
              totalPlants: currentData.totalPlants,
              lostPlants: currentData.lostPlants,
              entries,
              photos: currentData.photos.length,
              photoUrls: currentData.photos,
              date: isoDate,
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
              entries,
              photos: currentData.photos.length,
              photoUrls: currentData.photos,
              date: isoDate,
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
    harvestDate,
    updateHarvest,
    createHarvest,
    onCompleted,
  ]);

  return {
    currentData,
    loading: loading || createLoading || uploading,
    mode,
    harvestDate,
    setHarvestDate,
    handleBrixChange,
    handleBrixClassChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleFruitCountChange,
    handleYieldChange,
    handleSetShowBrix,
    handleSetShowFruitWeight,
    handleAddEntry,
    handleRemoveEntry,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  };
}
