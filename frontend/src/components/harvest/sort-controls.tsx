'use client';

import * as React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type HarvestSort } from './harvest-view-settings';

interface SortControlsProps {
  /** Currently active sort (single field + direction). */
  value: HarvestSort;
  /** Fired with the newly selected sort. */
  onChange: (sort: HarvestSort) => void;
  className?: string;
}

// Encode field+direction into a single Select value, e.g. "CROP:ASC".
const encode = (s: HarvestSort) => `${s.field}:${s.direction}`;
const decode = (v: string): HarvestSort => {
  const [field, direction] = v.split(':');
  return { field, direction } as HarvestSort;
};

/**
 * Compact sort selector: a single dropdown listing each field in both
 * directions, so exactly one sort is ever active. Mirrors the dashboard's
 * period <Select> styling.
 */
export function SortControls({
  value,
  onChange,
  className,
}: SortControlsProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const options: { value: string; label: string }[] = [
    {
      value: 'PLANTING_DATE:DESC',
      label: `${h.sortByPlantingDate} (${h.newestFirst})`,
    },
    {
      value: 'PLANTING_DATE:ASC',
      label: `${h.sortByPlantingDate} (${h.oldestFirst})`,
    },
    { value: 'CROP:ASC', label: `${h.sortByCrop} (${h.azOrder})` },
    { value: 'CROP:DESC', label: `${h.sortByCrop} (${h.zaOrder})` },
    { value: 'GREENHOUSE:ASC', label: `${h.sortByGreenhouse} (${h.azOrder})` },
    { value: 'GREENHOUSE:DESC', label: `${h.sortByGreenhouse} (${h.zaOrder})` },
  ];

  return (
    <Select value={encode(value)} onValueChange={(v) => onChange(decode(v))}>
      <SelectTrigger
        className={cn('h-9 w-52', className)}
        aria-label={h.sortBy}
      >
        <ArrowDownUp
          className="text-muted-foreground h-3.5 w-3.5"
          aria-hidden
        />
        <SelectValue placeholder={h.sortBy} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-sm"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
