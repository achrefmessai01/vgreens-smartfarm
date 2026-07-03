'use client';

import * as React from 'react';
import type { HarvestSummary } from '@/types/harvest.types';
import { useEditHarvest } from '@/lib/hooks/use-edit-harvest';
import type { SidebarMode } from '@/lib/hooks/use-batch-sidebar';
import { useDeleteHarvest } from '@/lib/hooks/use-delete-harvest';
import { useDeleteBatch } from '@/lib/hooks/use-delete-batch';
import type { BatchDetailsData } from '@/types/batch-sidebar.types';
import {
  computeSummary,
  harvestToBatchDetails,
  batchToBatchDetails,
} from '@/lib/harvest-utils';
import {
  InputMode,
  useHarvestsQuery,
  useBatchesQuery,
  useReorderBatchesMutation,
  type HarvestsQuery,
  type BatchesQuery,
  type CreateBatchMutation,
} from '@/generated/graphql';
import { useTenantIdVariable } from '@/lib/contexts/selected-tenant-context';
import { useHarvestViewSettings } from '@/lib/hooks/use-harvest-view-settings';
import { applyDashboardOrder } from '@/lib/hooks/use-harvest-dashboard-order';
import {
  setSort,
  setRange,
  setBatchCollapsed,
  toBatchesVariables,
  DEFAULT_HARVEST_VIEW,
  type HarvestViewState,
  type HarvestSort,
  HarvestDateRangePreset,
  HarvestSortField,
  OrderDirection,
} from '@/components/harvest/harvest-view-settings';

export type HarvestItem = HarvestsQuery['harvests'][number];
export type BatchItem = BatchesQuery['batches'][number];
type CreatedBatch = CreateBatchMutation['createBatch'];

// What the batch sidebar needs to create/edit a harvest: the batch it belongs
// to, the harvest being edited (null when creating a new one) and the prefilled
// details.
interface PendingBatch {
  batchId: string;
  harvestId: string | null;
  details: BatchDetailsData;
  initialDate?: string | null;
  // Harvest-level session timing + labor of the harvest being edited/viewed.
  initialStartTime?: string | null;
  initialStopTime?: string | null;
  initialHeadCount?: number | null;
}

export function useHarvestPage() {
  // Combined sort + plantingDate-range view state, owned here and passed down to
  // the presentational <SortControls> / <DateRangeFilter>. Hydrated once from
  // the user's persisted preference; valid changes are persisted back.
  const {
    persistedValue,
    persist: persistView,
    loading: viewLoading,
  } = useHarvestViewSettings();
  const [view, setView] =
    React.useState<HarvestViewState>(DEFAULT_HARVEST_VIEW);
  const hydratedRef = React.useRef(false);
  React.useEffect(() => {
    if (!viewLoading && !hydratedRef.current) {
      setView(persistedValue);
      hydratedRef.current = true;
    }
  }, [viewLoading, persistedValue]);

  // Optimistic manual order: the ordered batch-id list the user just produced by
  // dragging. Applied on top of the server list so a drop reorders instantly,
  // without waiting for the reorder mutation + refetch to round-trip. Empty
  // means "no local override" — the server-sorted order shows as-is. Cleared
  // whenever the user picks a different sort from the dropdown.
  const [manualOrder, setManualOrder] = React.useState<string[]>([]);

  // persist() fires a mutation whose optimisticResponse writes the Apollo cache
  // synchronously, so it must run from the event handler — never inside a
  // setView updater, which React executes during the render phase (that would
  // update `me` subscribers like TenantLayout mid-render). We compute `next`
  // from the current `view` and both set + persist it outside any updater.
  const handleSortChange = React.useCallback(
    (sort: HarvestSort) => {
      // A picked sort replaces any drag override so the chosen order wins.
      setManualOrder([]);
      const next = setSort(view, sort);
      setView(next);
      persistView(next);
    },
    [view, persistView],
  );

  const handleRangeChange = React.useCallback(
    (range: HarvestDateRangePreset) => {
      const next = setRange(view, range);
      setView(next);
      persistView(next);
    },
    [view, persistView],
  );

  // Collapse / expand a single batch's row, persisting the per-user state.
  const handleToggleCollapse = React.useCallback(
    (batchId: string, collapsed: boolean) => {
      const next = setBatchCollapsed(view, batchId, collapsed);
      if (next === view) return;
      setView(next);
      persistView(next);
    },
    [view, persistView],
  );

  // Active tenant scope (only meaningful for VGREENS_ADMIN; everyone else
  // ignores the variable and the backend falls back to their own tenant).
  const tenantId = useTenantIdVariable();

  // Server-side sort + filter: the batches query carries the order + range so
  // results stay correct regardless of how many batches exist.
  const batchesVariables = React.useMemo(
    () => ({ ...toBatchesVariables(view), tenantId }),
    [view, tenantId],
  );
  const isFiltered = Boolean(batchesVariables.filter);

  const {
    data: harvestsData,
    loading: harvestsLoading,
    refetch: refetchHarvests,
  } = useHarvestsQuery({
    fetchPolicy: 'cache-and-network',
    variables: { tenantId },
  });

  // Batches drive the table so a batch with no harvests yet still shows up.
  const {
    data: batchesData,
    loading: batchesLoading,
    refetch: refetchBatches,
  } = useBatchesQuery({
    fetchPolicy: 'cache-and-network',
    variables: batchesVariables,
  });

  const harvests = harvestsData?.harvests;
  const batches = React.useMemo(
    () => batchesData?.batches ?? [],
    [batchesData?.batches],
  );
  const loading = harvestsLoading || batchesLoading;

  const refetchAll = React.useCallback(() => {
    void refetchHarvests();
    void refetchBatches();
  }, [refetchHarvests, refetchBatches]);

  const [reorderBatchesMutation] = useReorderBatchesMutation();

  // Display order: apply the optimistic drag override (if any) over the
  // server-sorted list. `applyDashboardOrder` is stable and keeps ids missing
  // from the override at the end, so a freshly created batch still shows up.
  const orderedBatches = React.useMemo(
    () =>
      manualOrder.length > 0 ? applyDashboardOrder(batches, manualOrder) : batches,
    [batches, manualOrder],
  );

  // A drop in the list: dragging always means "this is my custom order", so we
  // (1) show it instantly via the override, (2) persist the new tenant-shared
  // rank, and (3) switch the active sort to MANUAL_ORDER so the arrangement
  // sticks across reloads. All side effects run here in the event handler.
  const handleReorder = React.useCallback(
    (orderedIds: string[]) => {
      setManualOrder(orderedIds);
      void reorderBatchesMutation({ variables: { ids: orderedIds, tenantId } });
      if (view.sort.field !== HarvestSortField.ManualOrder) {
        const next = setSort(view, {
          field: HarvestSortField.ManualOrder,
          direction: OrderDirection.Asc,
        });
        setView(next);
        persistView(next);
      }
    },
    [reorderBatchesMutation, tenantId, view, persistView],
  );

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
  // Id of the batch queued for deletion (null when the dialog is targeting a
  // single harvest instead).
  const [deleteBatchId, setDeleteBatchId] = React.useState<string | null>(null);
  const [isBatchDelete, setIsBatchDelete] = React.useState(false);
  const [pendingBatch, setPendingBatch] = React.useState<PendingBatch | null>(
    null,
  );

  const editHarvest = useEditHarvest({
    onSuccess: () => {
      setEditOpen(false);
      refetchAll();
    },
  });

  const { handleDelete, loading: deleteLoading } = useDeleteHarvest({
    onSuccess: () => {
      setDeleteOpen(false);
      setDeleteTarget(null);
      refetchAll();
    },
  });

  const { handleDeleteBatch, loading: deleteBatchLoading } = useDeleteBatch({
    onSuccess: () => {
      setDeleteOpen(false);
      setDeleteBatchId(null);
      setIsBatchDelete(false);
      refetchAll();
    },
  });

  const handleCreateBatch = React.useCallback(() => {
    setCreateBatchOpen(true);
  }, []);

  // A new batch was created: refresh the list (so the empty batch appears) and
  // open the sidebar to log its first harvest.
  const handleBatchCreated = React.useCallback(
    (batch: CreatedBatch) => {
      refetchBatches();
      setPendingBatch({
        batchId: batch.id,
        harvestId: null,
        details: batchToBatchDetails(batch),
        initialDate: null,
      });
      setSidebarMode('create');
      setBatchSidebarOpen(true);
    },
    [refetchBatches],
  );

  const handleSidebarCompleted = React.useCallback(() => {
    setBatchSidebarOpen(false);
    setPendingBatch(null);
    refetchAll();
  }, [refetchAll]);

  const handleBatchView = React.useCallback(
    (batch: BatchItem) => {
      setEditReadOnly(true);
      setEditBatchNumber(batch.batchNumber ?? null);
      editHarvest.populate(batch);
      setEditOpen(true);
    },
    [editHarvest],
  );

  const handleBatchEdit = React.useCallback(
    (batch: BatchItem) => {
      setEditReadOnly(false);
      setEditBatchNumber(batch.batchNumber ?? null);
      editHarvest.populate(batch);
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
      initialStartTime: harvest.startTime,
      initialStopTime: harvest.stopTime,
      initialHeadCount: harvest.harvesterHeadCount,
    });
    setSidebarMode('edit');
    setBatchSidebarOpen(true);
  }, []);

  // Open an existing harvest event read-only.
  const handleSidebarView = React.useCallback((harvest: HarvestItem) => {
    setPendingBatch({
      batchId: harvest.batchId,
      harvestId: harvest.id,
      details: harvestToBatchDetails(harvest),
      initialDate: harvest.date,
      initialStartTime: harvest.startTime,
      initialStopTime: harvest.stopTime,
      initialHeadCount: harvest.harvesterHeadCount,
    });
    setSidebarMode('view');
    setBatchSidebarOpen(true);
  }, []);

  // Log a brand-new harvest for an existing batch. The per-harvest input mode
  // defaults to the batch's most recent harvest's mode (the list is sorted
  // date DESC), so consecutive harvests keep the grower's habit; a batch with
  // no harvests yet starts in weight mode.
  const handleLogEntry = React.useCallback(
    (batch: BatchItem) => {
      const lastMode =
        (harvests ?? []).find((h) => h.batchId === batch.id)?.inputMode ??
        InputMode.Weight;
      setPendingBatch({
        batchId: batch.id,
        harvestId: null,
        details: batchToBatchDetails(batch, lastMode),
        initialDate: null,
      });
      setSidebarMode('create');
      setBatchSidebarOpen(true);
    },
    [harvests],
  );

  const handleDeleteRequest = React.useCallback((harvest: HarvestItem) => {
    setIsBatchDelete(false);
    setDeleteBatchId(null);
    setDeleteTarget(harvest);
    setDeleteOpen(true);
  }, []);

  // Deleting a batch soft-deletes the batch itself (the backend cascades to its
  // harvests); we no longer delete the harvest rows one by one.
  const handleBatchDeleteRequest = React.useCallback((batch: BatchItem) => {
    setIsBatchDelete(true);
    setDeleteTarget(null);
    setDeleteBatchId(batch.id);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (isBatchDelete) {
      if (deleteBatchId) await handleDeleteBatch(deleteBatchId);
      return;
    }
    if (deleteTarget) handleDelete(deleteTarget.id);
  }, [
    isBatchDelete,
    deleteBatchId,
    deleteTarget,
    handleDelete,
    handleDeleteBatch,
  ]);

  return {
    harvests,
    batches: orderedBatches,
    summary,
    loading,
    // Sort + filter view state for the presentational controls.
    view,
    isFiltered,
    handleSortChange,
    handleRangeChange,
    handleToggleCollapse,
    // Drag-and-drop reordering (always available in the list).
    handleReorder,
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
    handleSidebarView,
    handleLogEntry,
    handleBatchView,
    handleBatchEdit,
    editOpen,
    setEditOpen,
    editReadOnly,
    editBatchNumber,
    editHarvest,
    handleEditRequest: handleBatchEdit,
    deleteOpen,
    setDeleteOpen,
    deleteLoading: deleteLoading || deleteBatchLoading,
    handleDeleteRequest,
    handleBatchDeleteRequest,
    isBatchDelete,
    handleDeleteConfirm,
    refetchAll,
  };
}
