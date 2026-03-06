'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import {
  formatHarvestDate,
  getGreenhouseLabel,
} from '@/app/tenant/harvest/harvest.utils';
import { TableCell } from '@/components/ui/table';
import type { Harvest } from '@/generated/graphql';
import { DataTable, type Column } from '@/components/ui/data-table';

interface HarvestTableProps {
  harvests: Harvest[];
  onViewDetails?: (harvest: Harvest) => void;
  isLoading?: boolean;
  emptyState?: { title: string; description?: string };
  paginationLabels?: {
    showing: string;
    of: string;
    results: string;
    perPage: string;
    previous: string;
    next: string;
  };
}

const HARVEST_COLUMNS: Column<Harvest>[] = [
  { key: 'date', header: 'Date' },
  { key: 'batch', header: 'Batch' },
  { key: 'greenhouse', header: 'Greenhouse' },
  { key: 'classA', header: 'Class A (kg)' },
  { key: 'waste', header: 'Waste (kg)' },
  { key: 'avgBrix', header: 'Avg Brix' },
  { key: 'photos', header: 'Photos' },
  { key: 'actions', header: 'Actions', headerClassName: 'text-right' },
];

export function HarvestTable({
  harvests,
  onViewDetails,
  isLoading = false,
  emptyState,
  paginationLabels,
}: HarvestTableProps) {
  const renderRow = React.useCallback(
    (harvest: Harvest) => (
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
          <Eye className="h-4 w-4 text-muted-foreground" />
        </TableCell>
      </>
    ),
    [],
  );

  return (
    <DataTable<Harvest>
      data={harvests}
      columns={HARVEST_COLUMNS}
      renderRow={renderRow}
      onRowClick={onViewDetails}
      emptyState={{
        title: emptyState?.title ?? 'No harvests yet',
        description: emptyState?.description,
      }}
      paginationLabels={paginationLabels}
      paginationVariant="compact"
      defaultPageSize={15}
      isLoading={isLoading}
    />
  );
}
