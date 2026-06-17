'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  SORT_FIELDS,
  type HarvestSort,
  type HarvestSortField,
} from './harvest-view-settings';

interface SortControlsProps {
  /** Currently active sort (single field + direction). */
  value: HarvestSort;
  /** Fired with the clicked field; the parent decides how to cycle direction. */
  onToggle: (field: HarvestSortField) => void;
  className?: string;
}

/**
 * Presentational sort selector. Renders one toggle button per sortable field;
 * exactly one is active at a time. The active button exposes its direction both
 * visually (arrow icon) and to assistive tech (aria-pressed + sr-only text), so
 * direction is never conveyed by icon alone.
 */
export function SortControls({
  value,
  onToggle,
  className,
}: SortControlsProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const fieldLabel = (field: HarvestSortField): string => {
    switch (field) {
      case 'CROP':
        return h.sortByCrop;
      case 'GREENHOUSE':
        return h.sortByGreenhouse;
      case 'PLANTING_DATE':
        return h.sortByPlantingDate;
    }
  };

  return (
    <div
      role="group"
      aria-label={h.sortBy}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="text-muted-foreground text-sm font-medium">
        {h.sortBy}
      </span>
      {SORT_FIELDS.map((field) => {
        const active = value.field === field;
        const ascending = value.direction === 'ASC';
        const directionLabel = active
          ? ascending
            ? h.sortedAscending
            : h.sortedDescending
          : h.notSorted;
        return (
          <Button
            key={field}
            type="button"
            size="sm"
            variant={active ? 'default' : 'outline'}
            aria-pressed={active}
            onClick={() => onToggle(field)}
          >
            <span>{fieldLabel(field)}</span>
            {active ? (
              ascending ? (
                <ArrowUp aria-hidden="true" />
              ) : (
                <ArrowDown aria-hidden="true" />
              )
            ) : (
              <ArrowUpDown aria-hidden="true" className="opacity-50" />
            )}
            <span className="sr-only">{`(${directionLabel})`}</span>
          </Button>
        );
      })}
    </div>
  );
}
