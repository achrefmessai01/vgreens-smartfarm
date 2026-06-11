'use client';

import * as React from 'react';
import type { HarvestSummary } from '@/types/harvest.types';
import { useEditHarvest } from '@/lib/hooks/use-edit-harvest';
import type { SidebarMode } from '@/lib/hooks/use-batch-sidebar';
import { useDeleteHarvest } from '@/lib/hooks/use-delete-harvest';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import {
  computeSummary,
  harvestToBatchDetails,
  batchToBatchDetails,
} from '@/lib/harvest-utils';
import {
  useHarvestsQuery,
  type HarvestsQuery,
  type CreateBatchMutation,
} from '@/generated/graphql';

export type HarvestItem = HarvestsQuery['harvests'][number];
type CreatedBatch = CreateBatchMutation['createBatch'];

// What the batch sidebar needs to create/edit a harvest: the batch it belongs
// to, the harvest being edited (null when creating a new one) and the prefilled
// details.
interface PendingBatch {
  batchId: string;
  harvestId: string | null;
  details: BatchDetailsData;
  initialDate?: string | null;
}

export function useHarvestPage() {
  const { data, loading, refetch } = useHarvestsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const harvests = data?.harvests;
  const summary: HarvestSummary = React.useMemo(
    () => computeSummary(harvests ?? []),
    [harvests],
  );

  const [createBatchOpen, setCreateBatchOpen] = React.useState(false);
  const [batchSidebarOpen, setBatchSidebarOpen] = React.useState(false);
  const [sidebarMode, setSidebarMode] = React.useState<SidebarMode>('create');
  const [editOpen, setEditOpen] = React.useState(false);
  const [editReadOnly, setEditReadOnly] = React.useState(false);
  // batchNumber of the batch currently shown in the edit/view dialog. Read-only
  // (frozen field), so it lives alongside the dialog state rather than in the
  // editable BatchFormData.
  const [editBatchNumber, setEditBatchNumber] = React.useState<string | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<HarvestItem | null>(
    null,
  );
  const [deleteBatchTargetIds, setDeleteBatchTargetIds] = React.useState<
    string[]
  >([]);
  const [isBatchDelete, setIsBatchDelete] = React.useState(false);
  const [pendingBatch, setPendingBatch] = React.useState<PendingBatch | null>(
    null,
  );

  const editHarvest = useEditHarvest({
    onSuccess: () => {
      setEditOpen(false);
      refetch();
    },
  });

  const { handleDelete, loading: deleteLoading } = useDeleteHarvest({
    onSuccess: () => {
      setDeleteOpen(false);
      setDeleteTarget(null);
      refetch();
    },
  });

  const handleCreateBatch = React.useCallback(() => {
    setCreateBatchOpen(true);
  }, []);

  // A new batch was created: open the sidebar to log its first harvest.
  const handleBatchCreated = React.useCallback((batch: CreatedBatch) => {
    setPendingBatch({
      batchId: batch.id,
      harvestId: null,
      details: batchToBatchDetails(batch),
      initialDate: null,
    });
    setSidebarMode('create');
    setBatchSidebarOpen(true);
  }, []);

  const handleSidebarCompleted = React.useCallback(() => {
    setBatchSidebarOpen(false);
    setPendingBatch(null);
    refetch();
  }, [refetch]);

  const handleEditRequest = React.useCallback(
    (harvest: HarvestItem) => {
      setEditReadOnly(false);
      editHarvest.populate(harvest);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleBatchView = React.useCallback(
    (harvest: HarvestItem) => {
      setEditReadOnly(true);
      setEditBatchNumber(harvest.batch?.batchNumber ?? null);
      editHarvest.populate(harvest);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleBatchEdit = React.useCallback(
    (harvest: HarvestItem) => {
      setEditReadOnly(false);
      setEditBatchNumber(harvest.batch?.batchNumber ?? null);
      editHarvest.populate(harvest);
      setEditOpen(true);
    },
    [editHarvest],
  );

  // Edit an existing harvest event.
  const handleSidebarEdit = React.useCallback((harvest: HarvestItem) => {
    setPendingBatch({
      batchId: harvest.batchId,
      harvestId: harvest.id,
      details: harvestToBatchDetails(harvest),
      initialDate: harvest.date,
    });
    setSidebarMode('edit');
    setBatchSidebarOpen(true);
  }, []);

  // Log a brand-new harvest for an existing batch.
  const handleLogEntry = React.useCallback((harvest: HarvestItem) => {
    const details = harvest.batch
      ? batchToBatchDetails(harvest.batch)
      : harvestToBatchDetails(harvest);
    setPendingBatch({
      batchId: harvest.batchId,
      harvestId: null,
      details,
      initialDate: null,
    });
    setSidebarMode('create');
    setBatchSidebarOpen(true);
  }, []);

  const handleDeleteRequest = React.useCallback((harvest: HarvestItem) => {
    setIsBatchDelete(false);
    setDeleteBatchTargetIds([]);
    setDeleteTarget(harvest);
    setDeleteOpen(true);
  }, []);

  const handleBatchDeleteRequest = React.useCallback(
    (_batch: HarvestItem, entries: HarvestItem[]) => {
      setIsBatchDelete(true);
      setDeleteTarget(null);
      setDeleteBatchTargetIds(entries.map((entry) => entry.id));
      setDeleteOpen(true);
    },
    [],
  );

  const handleDeleteConfirm = React.useCallback(async () => {
    if (isBatchDelete) {
      for (const id of deleteBatchTargetIds) {
        await handleDelete(id, { skipSuccess: true });
      }
      setDeleteOpen(false);
      setDeleteBatchTargetIds([]);
      setIsBatchDelete(false);
      refetch();
      return;
    }
    if (deleteTarget) handleDelete(deleteTarget.id);
  }, [
    isBatchDelete,
    deleteBatchTargetIds,
    deleteTarget,
    handleDelete,
    refetch,
  ]);

  return {
    harvests,
    summary,
    loading,
    createBatchOpen,
    setCreateBatchOpen,
    batchSidebarOpen,
    setBatchSidebarOpen,
    sidebarMode,
    pendingBatch,
    handleCreateBatch,
    handleBatchCreated,
    handleSidebarCompleted,
    handleSidebarEdit,
    handleLogEntry,
    handleBatchView,
    handleBatchEdit,
    editOpen,
    setEditOpen,
    editReadOnly,
    editBatchNumber,
    editHarvest,
    handleEditRequest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    handleDeleteRequest,
    handleBatchDeleteRequest,
    isBatchDelete,
    handleDeleteConfirm,
  };
}
