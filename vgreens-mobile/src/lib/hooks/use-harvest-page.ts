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
  const [editReadOnly, setEditReadOnly] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HarvestItem | null>(null);
  const [deleteBatchIds, setDeleteBatchIds] = useState<string[]>([]);
  const [isBatchDelete, setIsBatchDelete] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<BatchSheetMode>('create');
  const [pendingBatch, setPendingBatch] = useState<PendingBatch | null>(null);

  const editHarvest = useEditHarvest(() => {
    setEditOpen(false);
    setEditReadOnly(false);
    void refetch();
  });
  const { handleDelete, loading: deleteLoading } = useDeleteHarvest(() => {
    setDeleteOpen(false);
    setDeleteTarget(null);
    void refetch();
  });

  const openEdit = useCallback(
    (h: HarvestItem, readOnly: boolean) => {
      setEditReadOnly(readOnly);
      editHarvest.populate(h);
      setEditOpen(true);
    },
    [editHarvest],
  );
  const openSheet = useCallback((h: HarvestItem, mode: BatchSheetMode) => {
    setPendingBatch({ id: h.id, details: harvestToBatchDetails(h) });
    setSheetMode(mode);
    setSheetOpen(true);
  }, []);

  const handleEditRequest = useCallback((h: HarvestItem) => openEdit(h, false), [openEdit]);
  const handleBatchView = useCallback((h: HarvestItem) => openEdit(h, true), [openEdit]);
  const handleBatchEdit = useCallback((h: HarvestItem) => openEdit(h, false), [openEdit]);
  const handleBatchCreated = useCallback((h: HarvestItem) => openSheet(h, 'create'), [openSheet]);
  const handleLogEntry = useCallback((h: HarvestItem) => openSheet(h, 'create'), [openSheet]);
  const handleCompleteRequest = useCallback((h: HarvestItem) => openSheet(h, 'edit'), [openSheet]);

  const handleSheetCompleted = useCallback(() => {
    setSheetOpen(false);
    setPendingBatch(null);
    void refetch();
  }, [refetch]);
  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setPendingBatch(null);
  }, []);

  const handleDeleteRequest = useCallback((h: HarvestItem) => {
    setIsBatchDelete(false);
    setDeleteBatchIds([]);
    setDeleteTarget(h);
    setDeleteOpen(true);
  }, []);
  const handleBatchDeleteRequest = useCallback(
    (_batch: HarvestItem, entries: HarvestItem[]) => {
      setIsBatchDelete(true);
      setDeleteTarget(null);
      setDeleteBatchIds(entries.map((e) => e.id));
      setDeleteOpen(true);
    },
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (isBatchDelete) {
      for (const id of deleteBatchIds) {
        await handleDelete(id, { skipSuccess: true });
      }
      setDeleteOpen(false);
      setDeleteBatchIds([]);
      setIsBatchDelete(false);
      void refetch();
      return;
    }
    if (deleteTarget) void handleDelete(deleteTarget.id);
  }, [isBatchDelete, deleteBatchIds, deleteTarget, handleDelete, refetch]);

  return {
    harvests,
    summary,
    loading,
    refetch,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    editReadOnly,
    editHarvest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    deleteTarget,
    isBatchDelete,
    handleEditRequest,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleBatchDeleteRequest,
    handleBatchView,
    handleBatchEdit,
    sheetOpen,
    sheetMode,
    pendingBatch,
    handleBatchCreated,
    handleLogEntry,
    handleCompleteRequest,
    handleSheetCompleted,
    handleSheetClose,
  };
}
