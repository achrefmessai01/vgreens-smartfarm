'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { DecimalInput } from '@/components/ui/decimal-input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { HarvestQualityClass } from '@/generated/graphql';

interface BrixReadingRowProps {
  index: number;
  value: number;
  brixClass: HarvestQualityClass;
  brixLabel: string;
  idPrefix: string;
  isLoading: boolean;
  canRemove: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onValueChange: (index: number, value: number) => void;
  onClassChange: (index: number, value: HarvestQualityClass) => void;
  onRemove: (index: number) => void;
  onEnter: (index: number) => void;
}

// One row of the Brix measurements list: the numeric input, a quality-class
// picker, and a remove button. Split out to keep the parent field under the
// 150-line component cap; the parent owns the readings/classes arrays.
export function BrixReadingRow({
  index,
  value,
  brixClass,
  brixLabel,
  idPrefix,
  isLoading,
  canRemove,
  inputRef,
  onValueChange,
  onClassChange,
  onRemove,
  onEnter,
}: BrixReadingRowProps) {
  const { t } = useI18n();
  const h = t.pages.harvest;
  const classOptions = [
    { value: HarvestQualityClass.A, label: h?.qualityA ?? 'Quality A' },
    { value: HarvestQualityClass.B, label: h?.qualityB ?? 'Quality B' },
    { value: HarvestQualityClass.C, label: h?.qualityC ?? 'Quality C' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter(index);
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={`${idPrefix}brix-${index + 1}`}>
        {brixLabel} {index + 1}
      </FieldLabel>
      <FieldContent>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DecimalInput
              id={`${idPrefix}brix-${index + 1}`}
              ref={inputRef}
              value={value}
              onChange={(v) => onValueChange(index, v)}
              onKeyDown={handleKeyDown}
              placeholder={`${h?.enterBrixValue ?? 'Enter Brix value'} ${index + 1}`}
              disabled={isLoading}
              className="pr-12"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
              &deg;Bx
            </span>
          </div>
          <Select
            value={brixClass}
            onValueChange={(v) => onClassChange(index, v as HarvestQualityClass)}
            disabled={isLoading}
          >
            <SelectTrigger
              className="h-9 w-28 shrink-0"
              aria-label={h?.qualityClass ?? 'Quality class'}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0"
            onClick={() => onRemove(index)}
            disabled={isLoading || !canRemove}
            aria-label={h?.removeReading ?? 'Remove reading'}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      </FieldContent>
    </Field>
  );
}
