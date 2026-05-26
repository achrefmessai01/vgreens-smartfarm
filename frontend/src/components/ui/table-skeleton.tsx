'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18nOptional } from '@/i18n';
import { getTranslations } from '@/i18n/translations';
import { cn } from '@/lib/utils';

const fallbackT = getTranslations('en');

interface TableSkeletonProps {
  /** Number of columns (default 5) */
  columnCount?: number;
  /** Number of body rows (default 8) */
  rowCount?: number;
  /** Optional wrapper class (e.g. for Card) */
  className?: string;
  /** Show header row with skeleton cells (default true) */
  showHeader?: boolean;
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 8,
  className,
  showHeader = true,
}: TableSkeletonProps) {
  const t = useI18nOptional()?.t ?? fallbackT;
  const headerWidths = ['w-24', 'w-32', 'w-28', 'w-36', 'w-20', 'w-24', 'w-28'];
  const cellWidths = ['w-32', 'w-40', 'w-24', 'w-48', 'w-20', 'w-24', 'w-28'];

  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-md border',
        className,
      )}
      aria-label={t.common.loadingTable}
    >
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i} className={cn(headerWidths[i] || 'w-24')}>
                  <Skeleton className="h-4 w-full max-w-[theme(spacing.24)]" />
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-border/50">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={cn(cellWidths[colIndex] || '')}
                >
                  <Skeleton
                    className="h-4 w-full"
                    style={{
                      maxWidth:
                        colIndex === 0
                          ? '8rem'
                          : colIndex === columnCount - 1
                            ? '4rem'
                            : undefined,
                    }}
                  />
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                  <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
