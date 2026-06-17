'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RANGE_PRESETS, HarvestDateRangePreset } from './harvest-view-settings';

interface PeriodFilterProps {
  /** Active plantingDate range preset. */
  value: HarvestDateRangePreset;
  /** Fired with the newly selected preset. */
  onChange: (preset: HarvestDateRangePreset) => void;
  className?: string;
}

/**
 * Relative plantingDate range selector. Mirrors the dashboard's period
 * <Select> (Clock-iconed presets) so the harvest-entry tab matches it.
 */
export function PeriodFilter({
  value,
  onChange,
  className,
}: PeriodFilterProps) {
  const { t } = useI18n();
  const c = t.common;

  const label: Record<HarvestDateRangePreset, string> = {
    [HarvestDateRangePreset.All]: c?.allTime ?? 'All time',
    [HarvestDateRangePreset.Today]: c?.today ?? 'Today',
    [HarvestDateRangePreset.ThisWeek]: c?.thisWeek ?? 'This Week',
    [HarvestDateRangePreset.ThisMonth]: c?.thisMonth ?? 'This Month',
    [HarvestDateRangePreset.LastMonth]: c?.lastMonth ?? 'Last Month',
    [HarvestDateRangePreset.ThisYear]: c?.thisYear ?? 'This Year',
  };

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as HarvestDateRangePreset)}
    >
      <SelectTrigger
        className={cn('h-9 w-40', className)}
        aria-label={t.pages.harvest.plantingDateRange}
      >
        <Clock className="text-muted-foreground h-3.5 w-3.5" aria-hidden />
        <SelectValue placeholder={c?.selectPeriod ?? 'Select period'} />
      </SelectTrigger>
      <SelectContent>
        {RANGE_PRESETS.map((preset) => (
          <SelectItem key={preset} value={preset} className="text-sm">
            {label[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
