'use client';

import * as React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  onSidebarView?: (harvest: HarvestItem) => void;
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
  /** Fired with the full new batch-id order after a drag-and-drop reorder. */
  onReorder?: (orderedIds: string[]) => void;
}

export function HarvestTable({
  batches,
  harvests,
  onDelete,
  onSidebarEdit,
  onSidebarView,
  onLogEntry,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
  isLoading = false,
  isFiltered = false,
  collapsedBatchIds,
  onToggleCollapse,
  onReorder,
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

  // Drag reordering is always available: a per-batch grip handle (see
  // HarvestBatchGroup) is the only drag activator, so clicking the card still
  // expands it. The 8px activation distance further separates taps from drags.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = groups.map((g) => g.key);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder?.(arrayMove(ids, oldIndex, newIndex));
    },
    [groups, onReorder],
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={groups.map((g) => g.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {groups.map((group) => (
            <HarvestBatchGroup
              key={group.key}
              group={group}
              collapsed={collapsedSet.has(group.key)}
              onToggleCollapse={onToggleCollapse}
              onDelete={onDelete}
              onSidebarEdit={onSidebarEdit}
              onSidebarView={onSidebarView}
              onLogEntry={onLogEntry}
              onViewBatch={onViewBatch}
              onEditBatch={onEditBatch}
              onDeleteBatch={onDeleteBatch}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
