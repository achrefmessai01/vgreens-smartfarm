'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  isValidRange,
  type HarvestDateRange,
} from './harvest-view-settings';

interface DateRangeFilterProps {
  /** Current plantingDate range (inclusive bounds; null = open-ended). */
  value: HarvestDateRange;
  /** Fired with the changed bound(s). */
  onChange: (patch: Partial<HarvestDateRange>) => void;
  className?: string;
}

const FROM_ID = 'harvest-planting-date-from';
const TO_ID = 'harvest-planting-date-to';

/**
 * Presentational plantingDate range filter. Two labelled native date inputs
 * (inclusive from/to). Surfaces an accessible validation message when `from`
 * is after `to`, and offers a clear action when any bound is set.
 */
export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;

  const invalid = !isValidRange(value);
  const hasValue = Boolean(value.from || value.to);
  const errorId = 'harvest-planting-date-error';

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <fieldset className="flex flex-wrap items-end gap-3 border-0 p-0">
        <legend className="text-muted-foreground mb-1 text-sm font-medium">
          {h.plantingDateRange}
        </legend>
        <div className="flex flex-col gap-1">
          <Label htmlFor={FROM_ID} className="text-xs">
            {h.dateFrom}
          </Label>
          <Input
            id={FROM_ID}
            type="date"
            className="w-auto"
            value={value.from ?? ''}
            max={value.to ?? undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => onChange({ from: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={TO_ID} className="text-xs">
            {h.dateTo}
          </Label>
          <Input
            id={TO_ID}
            type="date"
            className="w-auto"
            value={value.to ?? ''}
            min={value.from ?? undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </div>
      </fieldset>

      {hasValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({ from: null, to: null })}
        >
          <X aria-hidden="true" />
          {h.clear}
        </Button>
      )}

      {invalid && (
        <p id={errorId} role="alert" className="text-destructive w-full text-xs">
          {h.invalidDateRange}
        </p>
      )}
    </div>
  );
}
