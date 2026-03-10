'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import {
  formatHarvestDate,
  getGreenhouseLabel,
} from '@/app/tenant/harvest/harvest.utils';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import type { HarvestsQuery } from '@/generated/graphql';
import { DataTable, type Column } from '@/components/ui/data-table';
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config';

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
    pageSizeOptions: [10, 15, 25, 50]
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

  return (
    <DataTable<HarvestItem>
      data={harvests}
      columns={columns}
      renderRow={renderRow}
      onRowClick={onSidebarEdit}
      emptyState={{ title: h?.noHarvestsYet ?? 'No harvests yet' }}
      paginationVariant="compact"
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      isLoading={isLoading}
    />
  );
}
