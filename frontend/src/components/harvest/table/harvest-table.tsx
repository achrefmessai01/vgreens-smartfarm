'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import type { HarvestsQuery } from '@/generated/graphql';
import { Card, CardContent } from '@/components/ui/card';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { Calendar, Camera, Eye, Home, Package, Trash2 } from 'lucide-react';
import { formatHarvestDate, getGreenhouseLabel } from '@/lib/harvest-utils';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';

type HarvestItem = HarvestsQuery['harvests'][number];

function getCreatedByLabel(harvest: HarvestItem) {
  if (!harvest.createdBy) return '-';

  const fullName = [harvest.createdBy.firstName, harvest.createdBy.lastName]
    .filter(Boolean)
    .join(' ');

  return fullName || harvest.createdBy.email || '-';
}

interface HarvestTableProps {
  harvests: HarvestItem[];
  onEdit?: (harvest: HarvestItem) => void;
  onDelete?: (harvest: HarvestItem) => void;
  onSidebarEdit?: (harvest: HarvestItem) => void;
  isLoading?: boolean;
}

export function HarvestTable({
  harvests,
  onDelete,
  onSidebarEdit,
  isLoading = false,
}: HarvestTableProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const paginationConfig = usePaginationConfig({
    defaultPageSize: 15,
    pageSizeOptions: [10, 15, 25, 50],
  });

  const columns: Column<HarvestItem>[] = React.useMemo(
    () => [
      { key: 'date', header: h?.date ?? 'Date' },
      { key: 'batch', header: h?.batch ?? 'Batch' },
      { key: 'greenhouse', header: h?.greenhouse ?? 'Greenhouse' },
      { key: 'classA', header: h?.classA ?? 'Class A (kg)' },
      { key: 'waste', header: h?.waste ?? 'Waste (kg)' },
      { key: 'avgBrix', header: h?.avgBrix ?? 'Avg Brix' },
      { key: 'photos', header: h?.photos ?? 'Photos' },
      { key: 'createdBy', header: h?.createdBy ?? 'Created By' },
      {
        key: 'actions',
        header: h?.actions ?? 'Actions',
        headerClassName: 'text-right',
      },
    ],
    [h],
  );

  const renderRow = React.useCallback(
    (harvest: HarvestItem) => (
      <>
        <TableCell className="font-medium">
          {formatHarvestDate(harvest.date)}
        </TableCell>
        <TableCell className="text-muted-foreground">{harvest.batch}</TableCell>
        <TableCell className="font-medium text-blue-600">
          {getGreenhouseLabel(harvest.greenhouse)}
        </TableCell>
        <TableCell>
          <span
            className={cn('font-medium', 'text-green-600 dark:text-green-400')}
          >
            {harvest.classA}
          </span>
        </TableCell>
        <TableCell>
          <span className={cn('font-medium', 'text-red-600 dark:text-red-400')}>
            {harvest.waste}
          </span>
        </TableCell>
        <TableCell className="font-medium">
          {harvest.avgBrix}&deg;Bx
        </TableCell>
        <TableCell className="text-muted-foreground text-center">
          {harvest.photos === 0 ? '-' : harvest.photos}
        </TableCell>
        <TableCell className="text-muted-foreground max-w-[220px] truncate">
          {getCreatedByLabel(harvest)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onSidebarEdit?.(harvest);
              }}
            >
              <Eye className="text-muted-foreground h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(harvest);
              }}
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </>
    ),
    [onDelete, onSidebarEdit],
  );

  const renderCard = React.useCallback(
    (harvest: HarvestItem) => (
      <Card className="border-border/60 gap-0 overflow-hidden border py-0 shadow-sm transition-all hover:border-border hover:shadow-md">
        <CardContent className="px-4 py-4 sm:px-5">
          <div className="space-y-4">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="truncate">{formatHarvestDate(harvest.date)}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/20 flex min-w-0 items-start gap-3 rounded-lg border p-3">
                <Home className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted-foreground text-xs">
                    {h?.greenhouse ?? 'Greenhouse'}
                  </div>
                  <div className="truncate text-sm font-medium text-blue-600">
                    {getGreenhouseLabel(harvest.greenhouse)}
                  </div>
                </div>
              </div>
              <div className="bg-muted/20 flex min-w-0 items-start gap-3 rounded-lg border p-3">
                <Package className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-muted-foreground text-xs">
                    {h?.batch ?? 'Batch'}
                  </div>
                  <div className="truncate text-sm font-medium">
                    {harvest.batch}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 grid grid-cols-2 gap-3 rounded-lg p-3 text-center sm:grid-cols-3">
              <div>
                <div className="text-muted-foreground text-xs">
                  {h?.classA ?? 'Class A'}
                </div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {harvest.classA}
                  <span className="text-xs font-normal">kg</span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">
                  {h?.waste ?? 'Waste'}
                </div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {harvest.waste}
                  <span className="text-xs font-normal">kg</span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-muted-foreground text-xs">
                  {h?.avgBrix ?? 'Brix'}
                </div>
                <div className="text-lg font-semibold">
                  {harvest.avgBrix}
                  <span className="text-xs font-normal">&deg;Bx</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-muted/15 min-w-0 rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">
                  {h?.createdBy ?? 'Created By'}
                </div>
                <div className="truncate text-sm font-medium">
                  {getCreatedByLabel(harvest)}
                </div>
              </div>
              <div className="bg-muted/15 rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">
                  {h?.photos ?? 'Photos'}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Camera className="text-muted-foreground h-4 w-4" />
                  <span>{harvest.photos}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                className="h-auto min-h-10 w-full whitespace-normal px-4 py-2 text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onSidebarEdit?.(harvest);
                }}
              >
                {h?.viewDetails ?? 'View Details'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground h-auto min-h-10 w-full whitespace-normal px-4 py-2 text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(harvest);
                }}
              >
                {h?.deleteHarvest ?? 'Delete Harvest'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [h, onDelete, onSidebarEdit],
  );

  return (
    <DataTable<HarvestItem>
      data={harvests}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      onRowClick={onSidebarEdit}
      emptyState={{ title: h?.noHarvestsYet ?? 'No harvests yet' }}
      paginationVariant="compact"
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      isLoading={isLoading}
      responsiveBreakpoint="xl"
    />
  );
}
