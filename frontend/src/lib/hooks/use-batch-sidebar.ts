'use client';

import {
  HarvestQualityClass,
  HarvestsDocument,
  InputMode,
  useCreateHarvestMutation,
  useDeleteHarvestImageMutation,
  useUpdateHarvestMutation,
} from '@/generated/graphql';
import type {
  BatchDetailsData,
  EntryChange,
  HarvestEntryData,
} from '@/types/batch-sidebar.types';
import { useHarvestPhotosUpload } from '@/lib/hooks/use-harvest-photos-upload';
import {
  entryQualityTotalKg,
  extractStoragePathFromUrl,
  formatTimeOfDay,
  wasteExceedsQualityTotal,
} from '@/lib/harvest-utils';
import * as React from 'react';

export type SidebarMode = 'create' | 'edit' | 'view';

// Inline validation messages for the harvest-level timing/labor fields.
export interface HarvestTimingErrors {
  startTime?: string;
  stopTime?: string;
  harvesterHeadCount?: string;
}

interface UseBatchSidebarOptions {
  // Batch the harvest belongs to (used when creating a new harvest event).
  batchId: string | null;
  // Existing harvest being edited (edit mode only).
  harvestId: string | null;
  batchData: BatchDetailsData | null;
  mode?: SidebarMode;
  initialDate?: string | null;
  // Harvest-level session timing + labor of the harvest being edited/viewed.
  initialStartTime?: string | null;
  initialStopTime?: string | null;
  initialHeadCount?: number | null;
  onCompleted?: () => void;
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
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
  batchId,
  harvestId,
  batchData,
  mode = 'create',
  initialDate,
  initialStartTime,
  initialStopTime,
  initialHeadCount,
  onCompleted,
}: UseBatchSidebarOptions) {
  const [localData, setLocalData] = React.useState<BatchDetailsData | null>(
    null,
  );
  const [harvestDate, setHarvestDate] = React.useState<string>(todayIsoDate);
  // Harvest-level timing + labor. Kept as form strings ('' = unset); the time
  // inputs yield HH:mm and head count is a free-typed integer.
  const [startTime, setStartTime] = React.useState<string>('');
  const [stopTime, setStopTime] = React.useState<string>('');
  const [harvesterHeadCount, setHarvesterHeadCount] =
    React.useState<string>('');
  // Entry indices whose waste-exceeds-quality warning the user has explicitly
  // acknowledged. Any edit to an entry's waste/class inputs clears its
  // confirmation (see handleEntryChange) so the soft check is re-evaluated.
  const [confirmedWasteEntries, setConfirmedWasteEntries] = React.useState<
    ReadonlySet<number>
  >(() => new Set());
  const [createHarvest, { loading: createLoading }] =
    useCreateHarvestMutation();
  const [updateHarvest, { loading }] = useUpdateHarvestMutation();
  // Photos are stored under the harvest folder when editing, otherwise under
  // the batch folder while a new harvest is being composed.
  const { uploadPhotos, uploading } = useHarvestPhotosUpload(
    harvestId ?? batchId,
  );
  const [deleteHarvestImage] = useDeleteHarvestImageMutation();

  React.useEffect(() => {
    setLocalData(batchData);
    // Both edit and view operate on an existing harvest, so they show its
    // stored date; only a fresh create defaults to today.
    setHarvestDate(
      mode === 'create' ? todayIsoDate() : toIsoDateInput(initialDate),
    );
    // A fresh create starts blank; edit/view seed from the stored harvest.
    setStartTime(mode === 'create' ? '' : formatTimeOfDay(initialStartTime));
    setStopTime(mode === 'create' ? '' : formatTimeOfDay(initialStopTime));
    setHarvesterHeadCount(
      mode === 'create' || initialHeadCount == null
        ? ''
        : String(initialHeadCount),
    );
    // Fresh data: no waste warnings have been acknowledged yet.
    setConfirmedWasteEntries(new Set());
  }, [
    batchData,
    mode,
    initialDate,
    initialStartTime,
    initialStopTime,
    initialHeadCount,
  ]);

  // Mirror the server-side rules so errors surface inline before a save:
  // both-or-neither time, stop after start, positive-integer head count.
  const timingErrors = React.useMemo<HarvestTimingErrors>(() => {
    const errors: HarvestTimingErrors = {};
    const hasStart = startTime.trim() !== '';
    const hasStop = stopTime.trim() !== '';
    if (hasStart && !hasStop) {
      errors.stopTime = 'Stop time is required when start time is set';
    }
    if (!hasStart && hasStop) {
      errors.startTime = 'Start time is required when stop time is set';
    }
    if (
      hasStart &&
      hasStop &&
      timeToMinutes(stopTime) <= timeToMinutes(startTime)
    ) {
      errors.stopTime = 'Stop time must be after start time';
    }
    const head = harvesterHeadCount.trim();
    if (head !== '') {
      const n = Number(head);
      if (!Number.isInteger(n) || n <= 0) {
        errors.harvesterHeadCount = 'Must be a positive whole number';
      }
    }
    return errors;
  }, [startTime, stopTime, harvesterHeadCount]);

  const hasTimingErrors = Object.keys(timingErrors).length > 0;

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

  // Soft safety check, re-evaluated on every input change: flag any entry whose
  // waste exceeds its summed quality yield. An entry only blocks the save while
  // it's flagged AND not yet acknowledged; correcting the inputs clears the flag
  // and confirming clears the block. Mirrors the timing-error gate below.
  const hasUnconfirmedWasteWarning = React.useMemo(() => {
    const entries = currentData?.entries;
    if (!entries || !currentData) return false;
    return entries.some((entry, index) => {
      if (confirmedWasteEntries.has(index)) return false;
      const qualityTotal = entryQualityTotalKg(
        entry,
        currentData.inputMode,
        currentData.crateWeight,
      );
      return wasteExceedsQualityTotal(entry.waste, qualityTotal);
    });
  }, [currentData, confirmedWasteEntries]);

  // The crate dropdown is shown and required only in crate mode (it's where a
  // crate weight ever applied). Crate-mode harvest kg derivation depends on the
  // selection, so block the save until a crate is chosen.
  const isCrateMode = currentData?.inputMode === InputMode.Crate;
  const crateMissing = Boolean(isCrateMode) && !currentData?.crateId;
  const crateError = crateMissing
    ? 'Select a crate to continue'
    : undefined;

  // Pick a crate for the harvest: store its id and mirror its weight onto
  // crateWeight so the existing crate-mode kg derivation reads it unchanged.
  const handleCrateSelect = React.useCallback(
    (crateId: string, weight: number) => {
      setLocalData((prev) =>
        prev ? { ...prev, crateId, crateWeight: weight } : prev,
      );
    },
    [],
  );

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

  const handleSampleWeightChange = React.useCallback(
    (entryIndex: number, value: number) => {
      updateEntry(entryIndex, (entry) => ({ ...entry, sampleWeight: value }));
    },
    [updateEntry],
  );

  const handleSampleFruitCountChange = React.useCallback(
    (entryIndex: number, value: number) => {
      updateEntry(entryIndex, (entry) => ({
        ...entry,
        sampleFruitCount: value,
      }));
    },
    [updateEntry],
  );

  // Unified entry-field updates for both modes: per-class cells (weight kg, crate
  // count, remainder) addressed by class index; shared scalars (waste, row
  // coords); and add/remove of a whole quality class. add/remove grow/shrink all
  // three per-class arrays together (never below one class) so the mode-specific
  // arrays stay aligned and a class index is always valid.
  // Toggle the user's acknowledgement of an entry's waste-exceeds-quality
  // warning. Confirming lets the save proceed; un-confirming re-arms the gate.
  const setWasteConfirmed = React.useCallback(
    (entryIndex: number, confirmed: boolean) => {
      setConfirmedWasteEntries((prev) => {
        if (prev.has(entryIndex) === confirmed) return prev;
        const next = new Set(prev);
        if (confirmed) next.add(entryIndex);
        else next.delete(entryIndex);
        return next;
      });
    },
    [],
  );

  const handleEntryChange = React.useCallback(
    (entryIndex: number, change: EntryChange) => {
      // Any change to the quantities feeding the waste/quality comparison
      // invalidates a prior confirmation, so the warning is re-evaluated against
      // the new values. Row coordinates don't affect the comparison.
      const rowKinds = ['rowX', 'rowY', 'addRowPair', 'removeRowPair'];
      if (!rowKinds.includes(change.kind)) {
        setWasteConfirmed(entryIndex, false);
      }
      updateEntry(entryIndex, (entry) => {
        switch (change.kind) {
          case 'waste':
            return { ...entry, waste: change.value };
          case 'rowX': {
            const rowX = [...entry.rowX];
            rowX[change.index] = change.value;
            return { ...entry, rowX };
          }
          case 'rowY': {
            const rowY = [...entry.rowY];
            rowY[change.index] = change.value;
            return { ...entry, rowY };
          }
          case 'addRowPair':
            // Grow both arrays together so segment indices stay aligned.
            return {
              ...entry,
              rowX: [...entry.rowX, 0],
              rowY: [...entry.rowY, 0],
            };
          case 'removeRowPair': {
            // Never drop the last pair (the section always shows >= 1 while open).
            if (entry.rowX.length <= 1) return entry;
            const drop = <T>(arr: T[]) =>
              arr.filter((_, i) => i !== change.index);
            return { ...entry, rowX: drop(entry.rowX), rowY: drop(entry.rowY) };
          }
          case 'addClass':
            return {
              ...entry,
              classKgs: [...entry.classKgs, 0],
              crateCounts: [...entry.crateCounts, 0],
              remainingKgs: [...entry.remainingKgs, 0],
            };
          case 'removeClass': {
            if (entry.classKgs.length <= 1) return entry;
            const drop = <T>(arr: T[]) =>
              arr.filter((_, i) => i !== change.index);
            return {
              ...entry,
              classKgs: drop(entry.classKgs),
              crateCounts: drop(entry.crateCounts),
              remainingKgs: drop(entry.remainingKgs),
            };
          }
          default: {
            const key =
              change.kind === 'classKg'
                ? 'classKgs'
                : change.kind === 'crateCount'
                  ? 'crateCounts'
                  : 'remainingKgs';
            const next = [...entry[key]];
            next[change.index] = change.value;
            return { ...entry, [key]: next };
          }
        }
      });
    },
    [updateEntry, setWasteConfirmed],
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
    if (!currentData) return;
    // Don't submit while the harvest-level timing/labor fields are invalid,
    // while an entry's waste exceeds its quality yield without acknowledgement,
    // or while a crate-mode harvest has no crate selected.
    if (hasTimingErrors || hasUnconfirmedWasteWarning || crateMissing) return;

    // Map each sub-entry to the GraphQL input shape. Brix readings and the fruit
    // weight sample only count when their section is expanded. In weight mode the
    // entry carries its class kg directly; in crate mode it carries per-quality
    // crate counts + remainders and the backend derives the kg/total from the
    // batch crateWeight. The backend derives per-entry avgBrix / avgFruitWeight
    // (from the sample) and all totals.
    const isCrate = currentData.inputMode === InputMode.Crate;
    const entries = currentData.entries.map((entry) => {
      const brixReadings = entry.showBrix
        ? entry.brixReadings.map((value, i) => ({
            class: entry.brixClasses[i] ?? HarvestQualityClass.A,
            value,
          }))
        : [];
      // Sample weight is captured in grams; avgFruitWeight is derived backend-side.
      const sampleWeight = entry.showFruitWeight ? entry.sampleWeight : null;
      const sampleFruitCount = entry.showFruitWeight
        ? entry.sampleFruitCount
        : null;

      // Drop fully-empty (0,0) segments so opening the row section without
      // entering anything still persists as []. The kept pairs stay aligned, so
      // rowX/rowY remain equal-length for the backend's structural check.
      const keptPairs = entry.rowX
        .map((x, i) => ({ x, y: entry.rowY[i] ?? 0 }))
        .filter((p) => p.x > 0 || p.y > 0);
      const rowX = keptPairs.map((p) => p.x);
      const rowY = keptPairs.map((p) => p.y);

      if (isCrate) {
        return {
          rowX,
          rowY,
          waste: entry.waste,
          crateCounts: entry.crateCounts,
          remainingKgs: entry.remainingKgs,
          sampleWeight,
          sampleFruitCount,
          brixReadings,
        };
      }

      return {
        rowX,
        rowY,
        classKgs: entry.classKgs,
        waste: entry.waste,
        sampleWeight,
        sampleFruitCount,
        brixReadings,
      };
    });

    // Re-fetch the harvest list after every save so the table updates
    // immediately.
    const refetchOptions = {
      refetchQueries: [{ query: HarvestsDocument }],
      awaitRefetchQueries: true,
    };
    const isoDate = new Date(harvestDate).toISOString();
    // Harvest-level timing/labor: '' -> null (clears / leaves unset). Times are
    // sent as wall-clock HH:mm; the backend stores them in the local zone.
    const trimmedStart = startTime.trim();
    const trimmedStop = stopTime.trim();
    const trimmedHead = harvesterHeadCount.trim();
    const timingInput = {
      startTime: trimmedStart === '' ? null : trimmedStart,
      stopTime: trimmedStop === '' ? null : trimmedStop,
      harvesterHeadCount: trimmedHead === '' ? null : Number(trimmedHead),
    };
    try {
      // Crate-mode harvests carry the selected crate; weight mode sends null so
      // the backend leaves crateId unset (and ignores it for weight batches).
      const crateId = isCrate ? currentData.crateId : null;
      if (mode === 'create') {
        if (!batchId) return;
        await createHarvest({
          variables: {
            input: {
              batchId,
              crateId,
              date: isoDate,
              ...timingInput,
              photoUrls: currentData.photos,
              entries,
            },
          },
          ...refetchOptions,
        });
      } else {
        if (!harvestId) return;
        await updateHarvest({
          variables: {
            id: harvestId,
            input: {
              crateId,
              date: isoDate,
              ...timingInput,
              photoUrls: currentData.photos,
              entries,
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
    batchId,
    harvestId,
    currentData,
    mode,
    harvestDate,
    startTime,
    stopTime,
    harvesterHeadCount,
    hasTimingErrors,
    hasUnconfirmedWasteWarning,
    crateMissing,
    updateHarvest,
    createHarvest,
    onCompleted,
  ]);

  const canSave =
    (mode === 'create' ? Boolean(batchId) : Boolean(harvestId)) &&
    !hasTimingErrors &&
    !hasUnconfirmedWasteWarning &&
    !crateMissing;

  return {
    currentData,
    loading: loading || createLoading || uploading,
    mode,
    canSave,
    harvestDate,
    setHarvestDate,
    startTime,
    setStartTime,
    stopTime,
    setStopTime,
    harvesterHeadCount,
    setHarvesterHeadCount,
    timingErrors,
    isCrateMode: Boolean(isCrateMode),
    crateError,
    handleCrateSelect,
    confirmedWasteEntries,
    setWasteConfirmed,
    handleBrixChange,
    handleBrixClassChange,
    handleAddBrixReading,
    handleRemoveBrixReading,
    handleSampleWeightChange,
    handleSampleFruitCountChange,
    handleEntryChange,
    handleSetShowBrix,
    handleSetShowFruitWeight,
    handlePhotoUpload,
    handleRemovePhoto,
    handleSave,
  };
}
