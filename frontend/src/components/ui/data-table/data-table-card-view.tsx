'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface DataTableCardViewProps<T> {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTableCardView<T extends { id: string | number }>({
  data,
  renderCard,
  onRowClick,
}: DataTableCardViewProps<T>) {
  return (
    <div className="space-y-3 p-3">
      {data.map((item) => (
        <div
          key={item.id}
          className={cn(
            onRowClick &&
              'cursor-pointer transition-transform active:scale-[0.995]',
          )}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}
