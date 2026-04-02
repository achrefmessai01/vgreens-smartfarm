'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import * as React from 'react';
import type { Column } from './data-table';

interface DataTableTableViewProps<T> {
  data: T[];
  columns: Column<T>[];
  renderRow: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTableTableView<T extends { id: string | number }>({
  data,
  columns,
  renderRow,
  onRowClick,
}: DataTableTableViewProps<T>) {
  return (
    <Table className="[&_td]:px-4 [&_td]:py-3">
      <TableHeader>
        <TableRow className="border-border/60 bg-muted/20 border-b hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                'text-foreground h-11 px-4 font-semibold tracking-tight',
                col.headerClassName,
              )}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            className={cn(
              'border-border/40 border-b transition-colors',
              onRowClick &&
                'hover:bg-muted/40 active:bg-muted/50 cursor-pointer',
            )}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
          >
            {renderRow(item)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
