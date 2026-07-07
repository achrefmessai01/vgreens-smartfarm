'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type * as React from 'react';

interface SensorConfigPositionFieldProps {
  /** Used to derive the input id and matching aria-describedby target. */
  id: 'xPosition' | 'yPosition';
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Localized bounds error, or null when the axis value is valid. */
  error: string | null;
  /** Greenhouse footprint on this axis, forwarded to the input's `max` attr. */
  max: number | undefined;
  Icon: React.ElementType;
}

/**
 * One labeled numeric position input (x or y) with hint / bounds-error
 * feedback. Isolated in its own file so the parent form-fields component
 * fits under the 150-line hard limit.
 */
export function SensorConfigPositionField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  error,
  max,
  Icon,
}: SensorConfigPositionFieldProps) {
  const inputId = `field-${id}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        <Icon className="text-muted-foreground h-3.5 w-3.5" />
        {label}
      </Label>
      <Input
        id={inputId}
        type="number"
        step="0.01"
        min="0"
        max={max}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={error !== null || undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-9',
          error && 'border-destructive focus-visible:ring-destructive/30',
        )}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}
