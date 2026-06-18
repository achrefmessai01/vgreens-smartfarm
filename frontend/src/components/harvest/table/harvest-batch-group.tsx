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
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import {
  aggregateBatchTotals,
  getCreatedByLabel,
  type BatchGroup,
  type BatchItem,
  type HarvestItem,
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
  const { t, locale } = useI18n();
  const h = t.pages.harvest;
  const qualityALabel = h?.qualityA ?? 'Quality A';
  const qualityBLabel = h?.qualityB ?? 'Quality B';
  const qualityCLabel = h?.qualityC ?? 'Quality C';
  const wasteLabel = h?.waste ?? 'Waste';
  const { isMobile } = useResponsiveBreakpoint('lg');
  const visibleEntries = group.entries;
  const batch = group.batch;
  const totalLabel = h?.batchTotal ?? 'Batch total';
  const agg = React.useMemo(
    () => aggregateBatchTotals(visibleEntries, batch),
    [visibleEntries, batch],
  );

  return (
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
        className="bg-card rounded-xl border px-3 pb-2 shadow-sm sm:px-4"
      >
        <div className="pt-3">
          <div className="flex items-center justify-between gap-2">
            <AccordionTrigger className="min-w-0 flex-1 py-0 hover:no-underline">
              <p className="truncate text-base font-semibold sm:text-lg">
                {getGreenhouseLabel(batch?.greenhouse?.name)}
                {batch?.variety?.name ? ` - ${batch.variety.name}` : ''}
              </p>
            </AccordionTrigger>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-500/10 hover:text-green-600 hover:shadow-sm dark:hover:bg-green-500/20 dark:hover:text-green-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLogEntry?.(group.batch);
                }}
                aria-label={h?.logEntry ?? 'Log Entry'}
              >
                <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewBatch?.(group.batch);
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
                  onEditBatch?.(group.batch);
                }}
                aria-label={h?.editBatch ?? 'Edit Batch'}
              >
                <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="group hover:bg-destructive/10 dark:hover:bg-destructive/20 h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteBatch?.(group.batch, visibleEntries);
                }}
                aria-label={h?.deleteBatch ?? 'Delete Batch'}
              >
                <Trash2 className="text-destructive h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </Button>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground mt-1 mb-2 flex flex-wrap items-center gap-2 pl-6 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {visibleEntries.length}{' '}
            {harvestsLoggedLabel(visibleEntries.length, h, locale)}
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

        {collapsed && visibleEntries.length > 0 && (
          <div className="border-t pt-1">
            {!isMobile && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{totalLabel}</TableHead>
                    <TableHead>{qualityALabel}</TableHead>
                    <TableHead>{qualityBLabel}</TableHead>
                    <TableHead>{qualityCLabel}</TableHead>
                    <TableHead>{wasteLabel}</TableHead>
                    <TableHead>{h?.avgBrix ?? 'Avg Brix'}</TableHead>
                    <TableHead>
                      {h?.avgFruitWeight ?? 'Avg Fruit Weight'}
                    </TableHead>
                    <TableHead>
                      {h?.yieldPerPlantShort ?? 'Yield/Plant'}
                    </TableHead>
                    <TableHead>{h?.yieldPerMeterShort ?? 'Yield/m'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="font-medium">
                    <TableCell className="text-muted-foreground">
                      {visibleEntries.length}{' '}
                      {harvestsLoggedLabel(visibleEntries.length, h, locale)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {agg.classA}
                    </TableCell>
                    <TableCell className="text-teal-600">
                      {agg.classB}
                    </TableCell>
                    <TableCell className="text-amber-600">
                      {agg.classC}
                    </TableCell>
                    <TableCell className="text-red-500">{agg.waste}</TableCell>
                    <TableCell>{agg.avgBrix ?? 0}&deg;Bx</TableCell>
                    <TableCell>
                      {agg.avgFruitWeight == null
                        ? '—'
                        : `${agg.avgFruitWeight.toFixed(3)} kg`}
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
            )}

            {isMobile && (
              <div className="px-1 py-2">
                <div className="bg-card/80 border-border/70 space-y-3 rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                        {totalLabel}
                      </p>
                      <span className="text-sm font-semibold">
                        {visibleEntries.length}{' '}
                        {harvestsLoggedLabel(visibleEntries.length, h, locale)}
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
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <span className="text-muted-foreground block text-[11px]">
                        {qualityALabel}
                      </span>
                      <span className="text-base font-semibold text-green-600">
                        {agg.classA}
                      </span>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <span className="text-muted-foreground block text-[11px]">
                        {qualityBLabel}
                      </span>
                      <span className="text-base font-semibold text-teal-600">
                        {agg.classB}
                      </span>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <span className="text-muted-foreground block text-[11px]">
                        {qualityCLabel}
                      </span>
                      <span className="text-base font-semibold text-amber-600">
                        {agg.classC}
                      </span>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5">
                      <span className="text-muted-foreground block text-[11px]">
                        {wasteLabel}
                      </span>
                      <span className="text-base font-semibold text-red-500">
                        {agg.waste}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                      <TableHead>{qualityALabel}</TableHead>
                      <TableHead>{qualityBLabel}</TableHead>
                      <TableHead>{qualityCLabel}</TableHead>
                      <TableHead>{wasteLabel}</TableHead>
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
                      // All measurement figures come from the backend-computed
                      // totals on each harvest.
                      const totals = entry.totals;
                      const rowYieldPerPlant = totals.yieldPerPlant;
                      const rowYieldPerMeter = totals.yieldPerMeter;
                      const rowAvgFruitWeight = totals.avgFruitWeight;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{formatHarvestDate(entry.date)}</TableCell>
                          <TableCell className="text-green-600">
                            {totals.classA}
                          </TableCell>
                          <TableCell className="text-teal-600">
                            {totals.classB}
                          </TableCell>
                          <TableCell className="text-amber-600">
                            {totals.classC}
                          </TableCell>
                          <TableCell className="text-red-500">
                            {totals.waste}
                          </TableCell>
                          <TableCell>{totals.avgBrix ?? 0}&deg;Bx</TableCell>
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
                                onClick={() => onSidebarView?.(entry)}
                                aria-label={h?.viewDetails ?? 'View Details'}
                              >
                                <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="group h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-200"
                                onClick={() => onSidebarEdit?.(entry)}
                                aria-label={h?.editHarvest ?? 'Edit Harvest'}
                              >
                                <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="group hover:bg-destructive/10 dark:hover:bg-destructive/20 h-8 w-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                                onClick={() => onDelete?.(entry)}
                                aria-label={
                                  h?.deleteHarvest ?? 'Delete Harvest'
                                }
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
                            {entry.totals.avgBrix ?? 0}&deg;Bx
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 px-0.5 pt-1 text-sm">
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {qualityALabel}
                          </span>
                          <span className="text-base font-semibold text-green-600">
                            {entry.totals.classA}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {qualityBLabel}
                          </span>
                          <span className="text-base font-semibold text-teal-600">
                            {entry.totals.classB}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {qualityCLabel}
                          </span>
                          <span className="text-base font-semibold text-amber-600">
                            {entry.totals.classC}
                          </span>
                        </div>
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
                            className="group h-9 border-[#016f7c]/30 text-[#016f7c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:border-teal-300/40 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-100"
                            onClick={() => onSidebarView?.(entry)}
                            aria-label={h?.viewDetails ?? 'View Details'}
                          >
                            <Eye className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            {h?.viewDetails ?? 'View Details'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="group h-9 border-[#016f7c]/30 text-[#016f7c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#016f7c] hover:bg-[#016f7c]/10 hover:text-[#016f7c] hover:shadow-sm dark:border-teal-300/40 dark:text-teal-200 dark:hover:border-teal-200 dark:hover:bg-[#016f7c]/25 dark:hover:text-teal-100"
                            onClick={() => onSidebarEdit?.(entry)}
                            aria-label={h?.editHarvest ?? 'Edit Harvest'}
                          >
                            <Pencil className="mr-1 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            {h?.editHarvest ?? 'Edit'}
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
