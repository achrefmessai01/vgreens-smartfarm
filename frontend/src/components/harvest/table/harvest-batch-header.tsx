'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { AccordionTrigger } from '@/components/ui/accordion';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import {
  getGreenhouseLabel,
  harvestsLoggedLabel,
} from '@/lib/harvest-utils';
import type {
  BatchGroup,
  BatchItem,
  HarvestItem,
} from './harvest-table-utils';

interface HarvestBatchHeaderProps {
  group: BatchGroup;
  entries: HarvestItem[];
  /** Drag-handle node (grip) built by the sortable parent; rendered at the row start. */
  handle?: React.ReactNode;
  onLogEntry?: (batch: BatchItem) => void;
  onViewBatch?: (batch: BatchItem) => void;
  onEditBatch?: (batch: BatchItem) => void;
  onDeleteBatch?: (batch: BatchItem, entries: HarvestItem[]) => void;
}

// Reusable button styling — keeps the four header actions visually consistent.
const ACTION_BASE =
  'group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm';
const HOVER_GREEN =
  'hover:bg-green-500/10 hover:text-green-600 dark:hover:bg-green-500/20 dark:hover:text-green-300';
const HOVER_TEAL =
  'hover:bg-[#016f7c]/10 hover:text-[#016f7c] dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200';
const HOVER_BLUE =
  'hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-300';
const HOVER_DANGER =
  'hover:bg-destructive/10 dark:hover:bg-destructive/20';

export function HarvestBatchHeader({
  group,
  entries,
  handle,
  onLogEntry,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
}: HarvestBatchHeaderProps) {
  const { t, locale } = useI18n();
  const h = t.pages.harvest;
  const batch = group.batch;

  // The accordion trigger wraps the title, so action clicks must not bubble up
  // and accidentally toggle expand/collapse.
  const guard =
    (fn?: () => void): React.MouseEventHandler =>
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      fn?.();
    };

  return (
    <>
      <div className="pt-3">
        <div className="flex items-center justify-between gap-2">
          {handle}
          <AccordionTrigger className="min-w-0 flex-1 py-0 hover:no-underline">
            <p className="truncate text-base font-semibold sm:text-lg">
              {getGreenhouseLabel(batch?.greenhouse?.name)}
              {batch?.variety?.name
                ? ` - ${batch.variety.name}`
                : batch?.name
                  ? ` - ${batch.name}`
                  : ''}
            </p>
          </AccordionTrigger>
          <div className="flex shrink-0 items-center gap-1">
            <WriteActionButton
              size="icon"
              variant="ghost"
              className={`${ACTION_BASE} ${HOVER_GREEN}`}
              onClick={guard(() => onLogEntry?.(batch))}
              aria-label={h?.logEntry ?? 'Log Entry'}
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            </WriteActionButton>
            <Button
              size="icon"
              variant="ghost"
              className={`${ACTION_BASE} ${HOVER_TEAL}`}
              onClick={guard(() => onViewBatch?.(batch))}
              aria-label={h?.viewDetails ?? 'View Batch'}
            >
              <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            </Button>
            <WriteActionButton
              size="icon"
              variant="ghost"
              className={`${ACTION_BASE} ${HOVER_BLUE}`}
              onClick={guard(() => onEditBatch?.(batch))}
              aria-label={h?.editBatch ?? 'Edit Batch'}
            >
              <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            </WriteActionButton>
            <WriteActionButton
              size="icon"
              variant="ghost"
              className={`${ACTION_BASE} ${HOVER_DANGER}`}
              onClick={guard(() => onDeleteBatch?.(batch, entries))}
              aria-label={h?.deleteBatch ?? 'Delete Batch'}
            >
              <Trash2 className="text-destructive h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            </WriteActionButton>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground mt-1 mb-2 flex flex-wrap items-center gap-2 pl-6 text-xs">
        <Badge variant="secondary" className="text-[10px]">
          {entries.length} {harvestsLoggedLabel(entries.length, h, locale)}
        </Badge>
        {batch?.batchNumber && (
          <Badge
            variant="outline"
            className="font-mono text-[10px]"
            title={h?.batchNumber ?? 'Batch Number'}
          >
            {batch.batchNumber}
          </Badge>
        )}
        <span>{batch?.crop?.name ?? '-'}</span>
      </div>
    </>
  );
}
