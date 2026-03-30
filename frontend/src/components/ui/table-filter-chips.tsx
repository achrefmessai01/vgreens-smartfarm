'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  valueLabel: string;
  onRemove: () => void;
}

export interface TableFilterChipsProps {
  chips: FilterChip[];
  className?: string;
}

export function TableFilterChips({ chips, className }: TableFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="list"
    >
      {chips.map((chip) => (
        <span
          key={chip.id}
          role="listitem"
          className="border-border/60 bg-muted/30 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-sm"
        >
          <span className="text-muted-foreground">{chip.label}:</span>
          <span className="text-foreground font-medium">{chip.valueLabel}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
