'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import {
  groupByBatch,
  type BatchItem,
  type HarvestItem,
} from './harvest-table-utils';
import { HarvestTableSkeleton } from './harvest-table-skeleton';
import { HarvestBatchGroup } from './harvest-batch-group';

interface HarvestTableProps {
  batches: BatchItem[];
  harvests: HarvestItem[];
  onDelete?: (harvest: HarvestItem) => void;
  onSidebarEdit?: (harvest: HarvestItem) => void;
  onLogEntry?: (batch: BatchItem) => void;
  onViewBatch?: (batch: BatchItem) => void;
  onEditBatch?: (batch: BatchItem) => void;
  onDeleteBatch?: (batch: BatchItem, entries: HarvestItem[]) => void;
  isLoading?: boolean;
  /** True when a date-range filter is active — changes the empty-state copy. */
  isFiltered?: boolean;
  /** Batch IDs the user has collapsed (per-user persisted preference). */
  collapsedBatchIds?: string[];
  onToggleCollapse?: (batchId: string, collapsed: boolean) => void;
}

export function HarvestTable({
  batches,
  harvests,
  onDelete,
  onSidebarEdit,
  onLogEntry,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
  isLoading = false,
  isFiltered = false,
  collapsedBatchIds,
  onToggleCollapse,
}: HarvestTableProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const groups = React.useMemo(
    () => groupByBatch(batches, harvests),
    [batches, harvests],
  );
  const collapsedSet = React.useMemo(
    () => new Set(collapsedBatchIds ?? []),
    [collapsedBatchIds],
  );

  if (isLoading) return <HarvestTableSkeleton />;
  if (groups.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          {isFiltered ? h?.noMatchingBatches : h?.noHarvestsYet}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {isFiltered ? h?.adjustFiltersHint : h?.logFirstEntryHint}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <HarvestBatchGroup
          key={group.key}
          group={group}
          collapsed={collapsedSet.has(group.key)}
          onToggleCollapse={onToggleCollapse}
          onDelete={onDelete}
          onSidebarEdit={onSidebarEdit}
          onLogEntry={onLogEntry}
          onViewBatch={onViewBatch}
          onEditBatch={onEditBatch}
          onDeleteBatch={onDeleteBatch}
        />
      ))}
    </div>
  );
}
