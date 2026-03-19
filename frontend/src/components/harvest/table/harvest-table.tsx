'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import type { HarvestsQuery } from '@/generated/graphql';
import { Card, CardContent } from '@/components/ui/card';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';
import { Calendar, Eye, Home, Package, Scale, Trash2 } from 'lucide-react';
import { formatHarvestDate, getGreenhouseLabel } from '@/lib/harvest-utils';
import { DataTable, type Column } from '@/components/ui/data-table/data-table';

type HarvestItem = HarvestsQuery['harvests'][number];

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
        <TableCell className="font-medium">{harvest.avgBrix}°Bx</TableCell>
        <TableCell className="text-center text-muted-foreground">
          {harvest.photos === 0 ? '-' : harvest.photos}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {harvest.createdBy
            ? harvest.createdBy.firstName || harvest.createdBy.lastName
              ? [harvest.createdBy.firstName, harvest.createdBy.lastName]
                  .filter(Boolean)
                  .join(' ')
              : harvest.createdBy.email || '-'
            : '-'}
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
              <Eye className="h-4 w-4 text-muted-foreground" />
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
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </>
    ),
    [onDelete, onSidebarEdit],
  );

  const renderCard = React.useCallback(
    (harvest: HarvestItem) => (
      <Card className="gap-0 border-3 border-border py-0 transition-all shadow-md hover:shadow-xl hover:border-border/80">
        <CardContent className="px-4 py-4">
          <div className="space-y-1">
            {/* Date Header */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatHarvestDate(harvest.date)}</span>
            </div>

            {/* Greenhouse and Batch */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    {h?.greenhouse ?? 'Greenhouse'}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {getGreenhouseLabel(harvest.greenhouse)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">
                    {h?.batch ?? 'Batch'}
                  </div>
                  <div className="text-sm font-medium">{harvest.batch}</div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/30 p-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">
                  {h?.classA ?? 'Class A'}
                </div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {harvest.classA}
                  <span className="text-xs font-normal">kg</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {h?.waste ?? 'Waste'}
                </div>
                <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {harvest.waste}
                  <span className="text-xs font-normal">kg</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {h?.avgBrix ?? 'Brix'}
                </div>
                <div className="text-lg font-semibold">
                  {harvest.avgBrix}
                  <span className="text-xs font-normal">°Bx</span>
                </div>
              </div>
            </div>

            {/* Author and Photos */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="truncate">
                {harvest.createdBy
                  ? harvest.createdBy.firstName || harvest.createdBy.lastName
                    ? [harvest.createdBy.firstName, harvest.createdBy.lastName]
                        .filter(Boolean)
                        .join(' ')
                    : harvest.createdBy.email || '-'
                  : '-'}
              </div>
              <div className="flex items-center gap-1">
                <Scale className="h-3 w-3" />
                <span>
                  {harvest.photos === 0
                    ? 'No photos'
                    : `${harvest.photos} photo${harvest.photos === 1 ? '' : 's'}`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSidebarEdit?.(harvest);
                }}
              >
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(harvest);
                }}
              >
                Delete
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
      responsiveBreakpoint="lg"
    />
  );
}
