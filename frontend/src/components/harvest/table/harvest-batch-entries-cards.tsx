'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatHarvestDate } from '@/lib/harvest-utils';
import {
  getCreatedByLabel,
  type HarvestItem,
} from './harvest-table-utils';
import type { BatchGroupView } from './use-batch-group-view';

interface EntriesCardsProps {
  view: BatchGroupView;
  onSidebarView?: (entry: HarvestItem) => void;
  onSidebarEdit?: (entry: HarvestItem) => void;
  onDelete?: (entry: HarvestItem) => void;
}

const OUTLINE_TEAL =
  'group h-9 border-[#016f7c]/30 text-[#016f7c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:border-teal-300/40 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-100';
const DESTRUCTIVE_BTN =
  'group h-9 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';

/** Mobile expanded view: one stacked card per harvest entry. */
export function HarvestBatchEntriesCards({
  view,
  onSidebarView,
  onSidebarEdit,
  onDelete,
}: EntriesCardsProps) {
  const {
    h,
    entries,
    classIdxs,
    classLabel,
    classColor,
    classKgAt,
    wasteLabel,
  } = view;

  return (
    <div className="space-y-2 px-1 py-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-card/80 border-border/70 space-y-3 rounded-xl border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                {h?.date ?? 'Date'}
              </p>
              <span className="text-sm font-semibold">
                {formatHarvestDate(entry.date)}
              </span>
            </div>
            <div className="bg-muted/40 rounded-md px-2 py-1 text-right">
              <p className="text-muted-foreground text-[10px] uppercase">
                {h?.avgBrix ?? 'Avg Brix'}
              </p>
              <span className="text-sm leading-none font-semibold">
                {entry.totals.avgBrix ?? 0}&deg;Bx
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 px-0.5 pt-1 text-sm">
            {classIdxs.map((i) => (
              <div key={i} className="bg-muted/40 rounded-lg p-2.5">
                <span className="text-muted-foreground block text-[11px]">
                  {classLabel(i)}
                </span>
                <span className={`text-base font-semibold ${classColor(i)}`}>
                  {classKgAt(entry.totals.classKgs, i)}
                </span>
              </div>
            ))}
            <div className="bg-muted/40 rounded-lg p-2.5">
              <span className="text-muted-foreground block text-[11px]">
                {wasteLabel}
              </span>
              <span className="text-base font-semibold text-red-500">
                {entry.totals.waste}
              </span>
            </div>
          </div>

          <div className="border-border/70 mt-1 border-t px-0.5 pt-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                {h?.createdBy ?? 'Created By'}
              </p>
              <span className="text-muted-foreground truncate text-xs">
                {getCreatedByLabel(entry)}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={OUTLINE_TEAL}
                onClick={() => onSidebarView?.(entry)}
                aria-label={h?.viewDetails ?? 'View Details'}
              >
                <Eye className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {h?.viewDetails ?? 'View Details'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={OUTLINE_TEAL}
                onClick={() => onSidebarEdit?.(entry)}
                aria-label={h?.editHarvest ?? 'Edit Harvest'}
              >
                <Pencil className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {h?.editHarvest ?? 'Edit'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className={DESTRUCTIVE_BTN}
                onClick={() => onDelete?.(entry)}
                aria-label={h?.deleteHarvest ?? 'Delete Harvest'}
              >
                <Trash2 className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {h?.deleteHarvest ?? 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
