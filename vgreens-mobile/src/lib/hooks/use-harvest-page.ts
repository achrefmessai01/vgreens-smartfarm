import { useCallback, useMemo, useState } from 'react';
import { useHarvestsQuery, type HarvestsQuery } from '@/generated/graphql';
import { computeSummary, harvestToBatchDetails } from '@/lib/harvest-utils';
import { useDeleteHarvest } from '@/lib/hooks/use-delete-harvest';
import { useEditHarvest } from '@/lib/hooks/use-edit-harvest';
import type { BatchDetailsData, BatchSheetMode } from '@/types/batch-sheet';

export type HarvestItem = HarvestsQuery['harvests'][number];

type PendingBatch = { id: string; details: BatchDetailsData };

export function useHarvestPage() {
  const { data, loading, refetch } = useHarvestsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const harvests = data?.harvests;
  const summary = useMemo(() => computeSummary(harvests ?? []), [harvests]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HarvestItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<BatchSheetMode>('create');
  const [pendingBatch, setPendingBatch] = useState<PendingBatch | null>(null);

  const editHarvest = useEditHarvest(() => {
    setEditOpen(false);
    void refetch();
  });

  const { handleDelete, loading: deleteLoading } = useDeleteHarvest(() => {
    setDeleteOpen(false);
    setDeleteTarget(null);
    void refetch();
  });

  const handleEditRequest = useCallback(
    (h: HarvestItem) => {
      editHarvest.populate(h);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleDeleteRequest = useCallback((h: HarvestItem) => {
    setDeleteTarget(h);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) void handleDelete(deleteTarget.id);
  }, [deleteTarget, handleDelete]);

  const handleBatchCreated = useCallback((harvest: HarvestItem) => {
    setPendingBatch({ id: harvest.id, details: harvestToBatchDetails(harvest) });
    setSheetMode('create');
    setSheetOpen(true);
  }, []);

  const handleCompleteRequest = useCallback((harvest: HarvestItem) => {
    setPendingBatch({ id: harvest.id, details: harvestToBatchDetails(harvest) });
    setSheetMode('edit');
    setSheetOpen(true);
  }, []);

  const handleSheetCompleted = useCallback(() => {
    setSheetOpen(false);
    setPendingBatch(null);
    void refetch();
  }, [refetch]);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setPendingBatch(null);
  }, []);

  return {
    harvests,
    summary,
    loading,
    refetch,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    editHarvest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    deleteTarget,
    handleEditRequest,
    handleDeleteRequest,
    handleDeleteConfirm,
    sheetOpen,
    sheetMode,
    pendingBatch,
    handleBatchCreated,
    handleCompleteRequest,
    handleSheetCompleted,
    handleSheetClose,
  };
}
