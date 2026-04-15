import { useState, useCallback, useMemo } from 'react';
import { useHarvestsQuery, type HarvestsQuery } from '@/generated/graphql';
import { computeSummary } from '@/lib/harvest-utils';
import { useEditHarvest } from '@/lib/hooks/use-edit-harvest';
import { useDeleteHarvest } from '@/lib/hooks/use-delete-harvest';

export type HarvestItem = HarvestsQuery['harvests'][number];

export function useHarvestPage() {
  const { data, loading, refetch } = useHarvestsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const harvests = data?.harvests;
  const summary = useMemo(
    () => computeSummary(harvests ?? []),
    [harvests],
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HarvestItem | null>(null);

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
    handleEditRequest,
    handleDeleteRequest,
    handleDeleteConfirm,
    deleteTarget,
  };
}
