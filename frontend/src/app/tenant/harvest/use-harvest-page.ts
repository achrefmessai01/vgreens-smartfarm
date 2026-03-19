'use client';

import type { BatchDetailsData } from '@/components/harvest/batch-sidebar/batch-sidebar-types';
import type { SidebarMode } from '@/components/harvest/use-batch-sidebar';
import { useDeleteHarvest } from '@/components/harvest/dialogs/use-delete-harvest';
import { useEditHarvest } from '@/components/harvest/dialogs/use-edit-harvest';
import { useHarvestsQuery, type HarvestsQuery } from '@/generated/graphql';
import * as React from 'react';
import type { HarvestSummary } from './harvest.utils';
import { computeSummary, harvestToBatchDetails } from './harvest.utils';

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
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<HarvestItem | null>(
    null,
  );
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

  const handleDeleteRequest = React.useCallback((harvest: HarvestItem) => {
    setDeleteTarget(harvest);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    if (deleteTarget) handleDelete(deleteTarget.id);
  }, [deleteTarget, handleDelete]);

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
    editOpen,
    setEditOpen,
    editHarvest,
    handleEditRequest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    handleDeleteRequest,
    handleDeleteConfirm,
  };
}
