'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { formatHarvestDate } from '@/lib/harvest-utils';
import {
  getCreatedByLabel,
  type HarvestItem,
} from './harvest-table-utils';
import type { BatchGroupView } from './use-batch-group-view';

interface EntriesTableProps {
  view: BatchGroupView;
  onSidebarView?: (entry: HarvestItem) => void;
  onSidebarEdit?: (entry: HarvestItem) => void;
  onDelete?: (entry: HarvestItem) => void;
}

const ACTION_BASE =
  'group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm';
const HOVER_TEAL =
  'hover:bg-[#016f7c]/10 hover:text-[#016f7c] dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200';
const HOVER_DANGER =
  'hover:bg-destructive/10 dark:hover:bg-destructive/20';

/** Desktop expanded view: full per-harvest rows with action buttons. */
export function HarvestBatchEntriesTable({
  view,
  onSidebarView,
  onSidebarEdit,
  onDelete,
}: EntriesTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{h?.date ?? 'Date'}</TableHead>
          {classIdxs.map((i) => (
            <TableHead key={i}>{classLabel(i)}</TableHead>
          ))}
          <TableHead>{wasteLabel}</TableHead>
          <TableHead>{h?.avgBrix ?? 'Avg Brix'}</TableHead>
          <TableHead>{h?.avgFruitWeight ?? 'Avg Fruit Weight'}</TableHead>
          <TableHead>{h?.yieldPerPlantShort ?? 'Yield/Plant'}</TableHead>
          <TableHead>{h?.yieldPerRunningMeterShort ?? 'Yield/m'}</TableHead>
          <TableHead>{h?.createdBy ?? 'Created By'}</TableHead>
          <TableHead className="text-right">
            {h?.actions ?? 'Actions'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          // All measurement figures come from the backend-computed totals.
          const totals = entry.totals;
          return (
            <TableRow key={entry.id}>
              <TableCell>{formatHarvestDate(entry.date)}</TableCell>
              {classIdxs.map((i) => (
                <TableCell key={i} className={classColor(i)}>
                  {classKgAt(totals.classKgs, i)}
                </TableCell>
              ))}
              <TableCell className="text-red-500">{totals.waste}</TableCell>
              <TableCell>{totals.avgBrix ?? 0}&deg;Bx</TableCell>
              <TableCell>
                {totals.avgFruitWeight == null
                  ? '—'
                  : `${totals.avgFruitWeight.toFixed(1)} g`}
              </TableCell>
              <TableCell>
                {totals.yieldPerPlant == null
                  ? '—'
                  : `${totals.yieldPerPlant.toFixed(2)} kg`}
              </TableCell>
              <TableCell>
                {totals.yieldPerRunningMeter == null
                  ? '—'
                  : `${Number(totals.yieldPerRunningMeter.toFixed(3))} kg/m`}
              </TableCell>
              <TableCell className="max-w-[220px] truncate">
                {getCreatedByLabel(entry)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${ACTION_BASE} ${HOVER_TEAL}`}
                    onClick={() => onSidebarView?.(entry)}
                    aria-label={h?.viewDetails ?? 'View Details'}
                  >
                    <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${ACTION_BASE} ${HOVER_TEAL}`}
                    onClick={() => onSidebarEdit?.(entry)}
                    aria-label={h?.editHarvest ?? 'Edit Harvest'}
                  >
                    <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${ACTION_BASE} ${HOVER_DANGER}`}
                    onClick={() => onDelete?.(entry)}
                    aria-label={h?.deleteHarvest ?? 'Delete Harvest'}
                  >
                    <Trash2 className="text-destructive h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
