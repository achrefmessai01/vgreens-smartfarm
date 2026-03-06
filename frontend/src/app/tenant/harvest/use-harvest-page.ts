'use client';

import * as React from 'react';
import { useHarvestsQuery, type HarvestsQuery } from '@/generated/graphql';
import type { BatchDetailsData } from '@/components/harvest/batch-sidebar-types';
import { computeSummary, harvestToBatchDetails } from './harvest.utils';
import type { HarvestSummary } from './harvest.utils';

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

  const [selectedHarvest, setSelectedHarvest] =
    React.useState<HarvestItem | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [createBatchOpen, setCreateBatchOpen] = React.useState(false);
  const [batchSidebarOpen, setBatchSidebarOpen] = React.useState(false);
  const [pendingBatch, setPendingBatch] = React.useState<{
    id: string;
    details: BatchDetailsData;
  } | null>(null);

  const handleViewDetails = React.useCallback((harvest: HarvestItem) => {
    setSelectedHarvest(harvest);
    setDetailsOpen(true);
  }, []);

  const handleCreateBatch = React.useCallback(() => {
    setCreateBatchOpen(true);
  }, []);

  const handleBatchCreated = React.useCallback(
    (harvest: Parameters<typeof harvestToBatchDetails>[0]) => {
      const details = harvestToBatchDetails(harvest);
      setPendingBatch({ id: harvest.id, details });
      setBatchSidebarOpen(true);
    },
    [],
  );

  const handleSidebarCompleted = React.useCallback(() => {
    setBatchSidebarOpen(false);
    setPendingBatch(null);
    refetch();
  }, [refetch]);

  return {
    harvests,
    summary,
    loading,
    selectedHarvest,
    detailsOpen,
    setDetailsOpen,
    createBatchOpen,
    setCreateBatchOpen,
    batchSidebarOpen,
    setBatchSidebarOpen,
    pendingBatch,
    handleViewDetails,
    handleCreateBatch,
    handleBatchCreated,
    handleSidebarCompleted,
  };
}
