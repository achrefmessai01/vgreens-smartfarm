'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  formatHarvestDate,
  getGreenhouseLabel,
  harvestsLoggedLabel,
} from '@/lib/harvest-utils';
import { useHarvestClassBMode } from '@/lib/harvest-class-b-mode';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import {
  getCreatedByLabel,
  isAutoDraftPlaceholder,
  type BatchGroup,
  type HarvestItem,
} from './harvest-table-utils';

interface HarvestBatchGroupProps {
  group: BatchGroup;
  onDelete?: (harvest: HarvestItem) => void;
  onSidebarEdit?: (harvest: HarvestItem) => void;
  onLogEntry?: (harvest: HarvestItem) => void;
  onViewBatch?: (batch: HarvestItem) => void;
  onEditBatch?: (batch: HarvestItem) => void;
  onDeleteBatch?: (batch: HarvestItem, entries: HarvestItem[]) => void;
}

export function HarvestBatchGroup({
  group,
  onDelete,
  onSidebarEdit,
  onLogEntry,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
}: HarvestBatchGroupProps) {
  const { t, locale } = useI18n();
  const h = t.pages.harvest;
  const classBMode = useHarvestClassBMode();
  const secondaryHeader = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste (kg)');
  const primaryHeader = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.classA ?? 'Class A (kg)');
  const primaryMobileLabel = classBMode
    ? (h?.quality1 ?? 'Quality 1')
    : (h?.classA ?? 'Class A');
  const secondaryMobileLabel = classBMode
    ? (h?.quality2 ?? 'Quality 2')
    : (h?.waste ?? 'Waste');
  const { isMobile } = useResponsiveBreakpoint('lg');
  const visibleEntries = React.useMemo(
    () =>
      group.entries.filter(
        (entry) => !(isAutoDraftPlaceholder(entry) && group.entries.length > 1),
      ),
    [group.entries],
  );

  return (
    <Accordion type="single" collapsible defaultValue={group.key}>
      <AccordionItem
        value={group.key}
        className="bg-card rounded-xl border px-3 pb-2 shadow-sm sm:px-4"
      >
        <div className="pt-3">
          <div className="flex items-center justify-between gap-2">
            <AccordionTrigger className="min-w-0 flex-1 py-0 hover:no-underline">
              <p className="truncate text-base font-semibold sm:text-lg">
                {group.root.batch}
              </p>
            </AccordionTrigger>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewBatch?.(group.root);
                }}
                aria-label={h?.viewDetails ?? 'View Batch'}
              >
                <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500/10 hover:text-blue-600 hover:shadow-sm dark:hover:bg-blue-500/20 dark:hover:text-blue-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEditBatch?.(group.root);
                }}
                aria-label={h?.editBatch ?? 'Edit Batch'}
              >
                <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive/10 hover:shadow-sm dark:hover:bg-destructive/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteBatch?.(group.root, visibleEntries);
                }}
                aria-label={h?.deleteBatch ?? 'Delete Batch'}
              >
                <Trash2 className="text-destructive h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-500/10 hover:text-green-600 hover:shadow-sm dark:hover:bg-green-500/20 dark:hover:text-green-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLogEntry?.(group.root);
                }}
                aria-label={h?.logEntry ?? 'Log Entry'}
              >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground mt-1 mb-2 flex flex-wrap items-center gap-2 pl-6 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {visibleEntries.length}{' '}
            {harvestsLoggedLabel(visibleEntries.length, h, locale)}
          </Badge>
          {group.root.batchNumber && (
            <Badge
              variant="outline"
              className="font-mono text-[10px]"
              title={h?.batchNumber ?? 'Batch Number'}
            >
              {group.root.batchNumber}
            </Badge>
          )}
          <span>{getGreenhouseLabel(group.root.greenhouse)}</span>
        </div>
        <AccordionContent className="border-t">
          {visibleEntries.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              {h?.noHarvestsYet ?? 'No harvests yet'}
            </p>
          ) : (
            <>
              {!isMobile && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{h?.date ?? 'Date'}</TableHead>
                      <TableHead>{primaryHeader}</TableHead>
                      <TableHead>{secondaryHeader}</TableHead>
                      <TableHead>{h?.avgBrix ?? 'Avg Brix'}</TableHead>
                      <TableHead>
                        {h?.avgFruitWeight ?? 'Avg Fruit Weight'}
                      </TableHead>
                      <TableHead>
                        {h?.yieldPerPlantShort ?? 'Yield/Plant'}
                      </TableHead>
                      <TableHead>
                        {h?.yieldPerMeterShort ?? 'Yield/m'}
                      </TableHead>
                      <TableHead>{h?.createdBy ?? 'Created By'}</TableHead>
                      <TableHead className="text-right">
                        {h?.actions ?? 'Actions'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleEntries.map((entry) => {
                      const sellable = entry.classA + entry.classB;
                      const rowYieldPerPlant =
                        group.root.totalPlants > 0
                          ? sellable / group.root.totalPlants
                          : null;
                      const rowYieldPerMeter =
                        group.root.rowLength > 0
                          ? sellable / group.root.rowLength
                          : null;
                      // Derive on the fly from current yield + count so stale
                      // stored `avgFruitWeight` values (from before the total-
                      // weight input was removed) don't show up here.
                      const rowAvgFruitWeight =
                        entry.fruitCount > 0 && sellable > 0
                          ? sellable / entry.fruitCount
                          : null;
                      return (
                      <TableRow key={entry.id}>
                        <TableCell>{formatHarvestDate(entry.date)}</TableCell>
                        <TableCell className="text-green-600">
                          {entry.classA}
                        </TableCell>
                        <TableCell
                          className={
                            classBMode ? 'text-teal-600' : 'text-red-500'
                          }
                        >
                          {classBMode ? entry.classB : entry.waste}
                        </TableCell>
                        <TableCell>{entry.avgBrix}&deg;Bx</TableCell>
                        <TableCell>
                          {rowAvgFruitWeight == null
                            ? '—'
                            : `${rowAvgFruitWeight.toFixed(3)} kg`}
                        </TableCell>
                        <TableCell>
                          {rowYieldPerPlant == null
                            ? '—'
                            : `${rowYieldPerPlant.toFixed(2)} kg`}
                        </TableCell>
                        <TableCell>
                          {rowYieldPerMeter == null
                            ? '—'
                            : `${rowYieldPerMeter.toFixed(2)} kg/m`}
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          {getCreatedByLabel(entry)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200"
                              onClick={() => onSidebarEdit?.(entry)}
                              aria-label={h?.viewDetails ?? 'View Details'}
                            >
                              <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-destructive/10 hover:shadow-sm dark:hover:bg-destructive/20"
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
              )}

              {isMobile && (
                <div className="space-y-2 px-1 py-2">
                  {visibleEntries.map((entry) => (
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
                            {entry.avgBrix}&deg;Bx
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 px-0.5 pt-1 text-sm">
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {primaryMobileLabel}
                          </span>
                          <span className="text-base font-semibold text-green-600">
                            {entry.classA}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {secondaryMobileLabel}
                          </span>
                          <span
                            className={`text-base font-semibold ${classBMode ? 'text-teal-600' : 'text-red-500'}`}
                          >
                            {classBMode ? entry.classB : entry.waste}
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

                        <div className="mt-2.5 grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="group h-9 border-[#016f7c]/30 text-[#016f7c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:border-teal-300/40 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-100"
                            onClick={() => onSidebarEdit?.(entry)}
                            aria-label={h?.viewDetails ?? 'View Details'}
                          >
                            <Eye className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            {h?.viewDetails ?? 'View Details'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="group h-9 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
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
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
