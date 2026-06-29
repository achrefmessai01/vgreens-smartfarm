'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

/** Desktop view: one-row table summarising the whole batch. */
export function HarvestBatchCollapsedTable({
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{totalLabel}</TableHead>
          {classIdxs.map((i) => (
            <TableHead key={i}>{classLabel(i)}</TableHead>
          ))}
          <TableHead>{wasteLabel}</TableHead>
          <TableHead>{h?.avgBrix ?? 'Avg Brix'}</TableHead>
          <TableHead>{h?.avgFruitWeight ?? 'Avg Fruit Weight'}</TableHead>
          <TableHead>{h?.yieldPerPlantShort ?? 'Yield/Plant'}</TableHead>
          <TableHead>{h?.yieldPerMeterShort ?? 'Yield/m'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          className="hover:bg-muted/40 cursor-pointer font-medium transition-colors"
          {...interactiveProps(onExpand, onKeyDown, expandLabel)}
        >
          <TableCell className="text-muted-foreground">
            {entries.length} {harvestsLoggedLabel(entries.length, h, locale)}
          </TableCell>
          {classIdxs.map((i) => (
            <TableCell key={i} className={classColor(i)}>
              {classKgAt(agg.classKgs, i)}
            </TableCell>
          ))}
          <TableCell className="text-red-500" title={`${agg.waste} kg`}>
            {formatWastePercent(agg.waste, agg.classKgs)}
          </TableCell>
          <TableCell>{agg.avgBrix ?? 0}&deg;Bx</TableCell>
          <TableCell>
            {agg.avgFruitWeight == null
              ? '—'
              : `${agg.avgFruitWeight.toFixed(1)} g`}
          </TableCell>
          <TableCell>
            {agg.yieldPerPlant == null
              ? '—'
              : `${agg.yieldPerPlant.toFixed(2)} kg`}
          </TableCell>
          <TableCell>
            {agg.yieldPerMeter == null
              ? '—'
              : `${agg.yieldPerMeter.toFixed(2)} kg/m`}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
