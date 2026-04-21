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
import { Eye, Plus, Trash2 } from 'lucide-react';
import { formatHarvestDate, getGreenhouseLabel } from '@/lib/harvest-utils';
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
}

export function HarvestBatchGroup({
  group,
  onDelete,
  onSidebarEdit,
  onLogEntry,
}: HarvestBatchGroupProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
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
        <div className="flex items-center justify-between gap-3 pt-3">
          <AccordionTrigger className="min-w-0 flex-1 py-0 hover:no-underline">
            <p className="truncate text-base font-semibold sm:text-lg">
              {group.root.batch}
            </p>
          </AccordionTrigger>
          <Button
            size="sm"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              onLogEntry?.(group.root);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            {h?.logEntry ?? 'Log Entry'}
          </Button>
        </div>
        <div className="text-muted-foreground mt-1 mb-2 flex flex-wrap items-center gap-2 pl-6 text-xs">
          <Badge variant="secondary" className="text-[10px]">
            {visibleEntries.length} {h?.harvestsLogged ?? 'harvests logged'}
          </Badge>
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
                      <TableHead>{h?.classA ?? 'Class A (kg)'}</TableHead>
                      <TableHead>{h?.waste ?? 'Waste (kg)'}</TableHead>
                      <TableHead>{h?.avgBrix ?? 'Avg Brix'}</TableHead>
                      <TableHead>{h?.createdBy ?? 'Created By'}</TableHead>
                      <TableHead className="text-right">
                        {h?.actions ?? 'Actions'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatHarvestDate(entry.date)}</TableCell>
                        <TableCell className="text-green-600">
                          {entry.classA}
                        </TableCell>
                        <TableCell className="text-red-500">
                          {entry.waste}
                        </TableCell>
                        <TableCell>{entry.avgBrix}&deg;Bx</TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          {getCreatedByLabel(entry)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onSidebarEdit?.(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onDelete?.(entry)}
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                            {h?.classA ?? 'Class A'}
                          </span>
                          <span className="text-base font-semibold text-green-600">
                            {entry.classA}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2.5">
                          <span className="text-muted-foreground block text-[11px]">
                            {h?.waste ?? 'Waste'}
                          </span>
                          <span className="text-base font-semibold text-red-500">
                            {entry.waste}
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
                            className="h-9"
                            onClick={() => onSidebarEdit?.(entry)}
                            aria-label={h?.viewDetails ?? 'View Details'}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            {h?.viewDetails ?? 'View Details'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-9"
                            onClick={() => onDelete?.(entry)}
                            aria-label={h?.deleteHarvest ?? 'Delete Harvest'}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
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
