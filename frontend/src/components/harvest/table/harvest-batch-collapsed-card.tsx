'use client';

import * as React from 'react';
import {
  formatWastePercent,
  harvestsLoggedLabel,
} from '@/lib/harvest-utils';
import type { BatchGroupView } from './use-batch-group-view';
import { interactiveProps } from './harvest-batch-summary-utils';

interface Props {
  view: BatchGroupView;
  onExpand: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/** Mobile view: card with the same data laid out vertically. */
export function HarvestBatchCollapsedCard({
  view,
  onExpand,
  onKeyDown,
}: Props) {
  const {
    h,
    locale,
    entries,
    agg,
    classIdxs,
    classLabel,
    classColor,
    classKgAt,
    wasteLabel,
    totalLabel,
  } = view;
  const expandLabel = h?.expandBatch ?? 'Expand batch';

  return (
    <div className="px-1 py-2">
      <div
        className="bg-card/80 border-border/70 hover:bg-muted/40 cursor-pointer space-y-3 rounded-xl border p-4 transition-colors"
        {...interactiveProps(onExpand, onKeyDown, expandLabel)}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
              {totalLabel}
            </p>
            <span className="text-sm font-semibold">
              {entries.length} {harvestsLoggedLabel(entries.length, h, locale)}
            </span>
          </div>
          <div className="bg-muted/40 rounded-md px-2 py-1 text-right">
            <p className="text-muted-foreground text-[10px] uppercase">
              {h?.avgBrix ?? 'Avg Brix'}
            </p>
            <span className="text-sm leading-none font-semibold">
              {agg.avgBrix ?? 0}&deg;Bx
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
                {classKgAt(agg.classKgs, i)}
              </span>
            </div>
          ))}
          <div
            className="bg-muted/40 rounded-lg p-2.5"
            title={`${agg.waste} kg`}
          >
            <span className="text-muted-foreground block text-[11px]">
              {wasteLabel}
            </span>
            <span className="text-base font-semibold text-red-500">
              {formatWastePercent(agg.waste, agg.classKgs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
