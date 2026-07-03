'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { useBatchGroupView } from './use-batch-group-view';
import { HarvestBatchHeader } from './harvest-batch-header';
import { HarvestBatchCollapsedCard } from './harvest-batch-collapsed-card';
import { HarvestBatchCollapsedTable } from './harvest-batch-collapsed-table';
import { HarvestBatchEntriesTable } from './harvest-batch-entries-table';
import { HarvestBatchEntriesCards } from './harvest-batch-entries-cards';
import type {
  BatchGroup,
  BatchItem,
  HarvestItem,
} from './harvest-table-utils';

interface HarvestBatchGroupProps {
  group: BatchGroup;
  /** Whether this batch is collapsed to its single aggregated row. */
  collapsed?: boolean;
  onToggleCollapse?: (batchId: string, collapsed: boolean) => void;
  onDelete?: (harvest: HarvestItem) => void;
  onSidebarEdit?: (harvest: HarvestItem) => void;
  onSidebarView?: (harvest: HarvestItem) => void;
  onLogEntry?: (batch: BatchItem) => void;
  onViewBatch?: (batch: BatchItem) => void;
  onEditBatch?: (batch: BatchItem) => void;
  onDeleteBatch?: (batch: BatchItem, entries: HarvestItem[]) => void;
}

/**
 * Container for a single batch in the harvest list. Owns only the accordion
 * shell, the collapsed/expanded routing, and the click/keyboard wiring; every
 * actual layout (header, collapsed summary, expanded rows) lives in a focused
 * sub-component to keep this file readable and under 150 lines.
 */
export function HarvestBatchGroup({
  group,
  collapsed = false,
  onToggleCollapse,
  onDelete,
  onSidebarEdit,
  onSidebarView,
  onLogEntry,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
}: HarvestBatchGroupProps) {
  const { isMobile } = useResponsiveBreakpoint('lg');
  const view = useBatchGroupView(group);
  const { h, entries } = view;
  const hasEntries = entries.length > 0;

  // Sortable wiring: the whole card moves (setNodeRef + transform), but only the
  // grip handle in the header activates a drag (setActivatorNodeRef + listeners),
  // so clicking the card still expands/collapses it.
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.key });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // The grip is built here (where the sortable refs/listeners are local) and
  // handed to the header as a node, so only it activates a drag while the rest
  // of the card keeps its expand/collapse click. stopPropagation guards a plain
  // click on the grip from toggling the accordion.
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      aria-label={h?.dragToReorder ?? 'Drag to reorder'}
      title={h?.dragToReorder ?? 'Drag to reorder'}
      className="text-muted-foreground/40 hover:text-foreground hover:bg-accent -ml-1.5 flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md transition-colors active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  // Clicking the collapsed row expands the batch — same UX users get from the
  // title chevron. Keyboard users get Enter/Space via the handler below.
  const expandBatch = React.useCallback(() => {
    onToggleCollapse?.(group.key, false);
  }, [onToggleCollapse, group.key]);
  const handleSummaryKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        expandBatch();
      }
    },
    [expandBatch],
  );

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-10' : undefined}>
      <Accordion
        type="single"
        collapsible
        value={collapsed ? '' : group.key}
        onValueChange={(value) =>
          onToggleCollapse?.(group.key, value !== group.key)
        }
      >
        <AccordionItem
          value={group.key}
          className={cn(
            'bg-card rounded-xl border px-3 pb-2 shadow-sm transition-shadow sm:px-4',
            // Lift the card while dragging so it clearly floats above the rest.
            isDragging && 'ring-primary/40 opacity-90 shadow-xl ring-2',
          )}
        >
          <HarvestBatchHeader
            group={group}
            entries={entries}
            handle={handle}
            onLogEntry={onLogEntry}
            onViewBatch={onViewBatch}
            onEditBatch={onEditBatch}
            onDeleteBatch={onDeleteBatch}
          />

        {collapsed && hasEntries && (
          <div className="border-t pt-1">
            {isMobile ? (
              <HarvestBatchCollapsedCard
                view={view}
                onExpand={expandBatch}
                onKeyDown={handleSummaryKeyDown}
              />
            ) : (
              <HarvestBatchCollapsedTable
                view={view}
                onExpand={expandBatch}
                onKeyDown={handleSummaryKeyDown}
              />
            )}
          </div>
        )}

        <AccordionContent className="border-t">
          {!hasEntries ? (
            <p className="text-muted-foreground py-4 text-sm">
              {h?.noHarvestsYet ?? 'No harvests yet'}
            </p>
          ) : isMobile ? (
            <HarvestBatchEntriesCards
              view={view}
              onSidebarView={onSidebarView}
              onSidebarEdit={onSidebarEdit}
              onDelete={onDelete}
            />
          ) : (
            <HarvestBatchEntriesTable
              view={view}
              onSidebarView={onSidebarView}
              onSidebarEdit={onSidebarEdit}
              onDelete={onDelete}
            />
          )}
        </AccordionContent>
      </AccordionItem>
      </Accordion>
    </div>
  );
}
