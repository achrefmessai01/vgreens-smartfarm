'use client';

import * as React from 'react';
import type { HarvestSummary } from '@/types/harvest.types';
import { useEditHarvest } from '@/lib/hooks/use-edit-harvest';
import type { SidebarMode } from '@/lib/hooks/use-batch-sidebar';
import { useDeleteHarvest } from '@/lib/hooks/use-delete-harvest';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import { computeSummary, harvestToBatchDetails } from '@/lib/harvest-utils';
import { useHarvestsQuery, type HarvestsQuery } from '@/generated/graphql';

export type HarvestItem = HarvestsQuery['harvests'][number];

export function useHarvestPage() {
  const { data, loading, refetch } = useHarvestsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const harvests = data?.harvests;
  const summary: HarvestSummary = React.useMemo(
    () => computeSummary(harvests || []),
    [harvests],
  );

  const [createBatchOpen, setCreateBatchOpen] = React.useState(false);
  const [batchSidebarOpen, setBatchSidebarOpen] = React.useState(false);
  const [sidebarMode, setSidebarMode] = React.useState<SidebarMode>('create');
  const [editOpen, setEditOpen] = React.useState(false);
  const [editReadOnly, setEditReadOnly] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<HarvestItem | null>(
    null,
  );
  const [deleteBatchTargetIds, setDeleteBatchTargetIds] = React.useState<
    string[]
  >([]);
  const [isBatchDelete, setIsBatchDelete] = React.useState(false);
  const [pendingBatch, setPendingBatch] = React.useState<{
    id: string;
    details: BatchDetailsData;
  } | null>(null);

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

  const handleBatchCreated = React.useCallback(
    (harvest: Parameters<typeof harvestToBatchDetails>[0]) => {
      const details = harvestToBatchDetails(harvest);
      setPendingBatch({ id: harvest.id, details });
      setSidebarMode('create');
      setBatchSidebarOpen(true);
    },
    [],
  );

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
      editHarvest.populate(harvest);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleBatchEdit = React.useCallback(
    (harvest: HarvestItem) => {
      setEditReadOnly(false);
      editHarvest.populate(harvest);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleSidebarEdit = React.useCallback((harvest: HarvestItem) => {
    const details = harvestToBatchDetails(harvest);
    setPendingBatch({ id: harvest.id, details });
    setSidebarMode('edit');
    setBatchSidebarOpen(true);
  }, []);

  const handleLogEntry = React.useCallback((harvest: HarvestItem) => {
    const details = harvestToBatchDetails(harvest);
    setPendingBatch({ id: harvest.id, details });
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
  }, [isBatchDelete, deleteBatchTargetIds, deleteTarget, handleDelete, refetch]);

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
