'use client';

import * as React from 'react';
import { AlertCircle, ChevronRight, Trash2 } from 'lucide-react';
import { WriteActionButton } from '@/components/ui/write-action-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { GreenhouseRowFields } from './greenhouse-row-fields';
import type {
  GreenhouseRowData,
  GreenhouseRowErrors,
} from './use-farm-layout-config';

interface GreenhouseRowProps {
  row: GreenhouseRowData;
  index: number;
  disabled: boolean;
  expanded: boolean;
  onToggle: () => void;
  errors?: GreenhouseRowErrors;
  errorMessages: { name: string; dimensions: string; bayCount: string };
  greenhouseLabel: string;
  nameLabel: string;
  xLabel: string;
  yLabel: string;
  doorLabel: string;
  bayCountLabel: string;
  orientationLabel: string;
  visibilityLabel: string;
  visibilityHint: string;
  namePlaceholder: string;
  xPlaceholder: string;
  yPlaceholder: string;
  doorPositionPlaceholder: string;
  bayCountPlaceholder: string;
  onChange: (index: number, patch: Partial<GreenhouseRowData>) => void;
  onRemove: (index: number) => void;
  /** Extra per-greenhouse sections (crops, irrigation cycles) rendered at the bottom of the card. */
  children?: React.ReactNode;
}

export function GreenhouseRow({
  row,
  index,
  disabled,
  expanded,
  onToggle,
  errors,
  errorMessages,
  greenhouseLabel,
  nameLabel,
  xLabel,
  yLabel,
  doorLabel,
  bayCountLabel,
  orientationLabel,
  visibilityLabel,
  visibilityHint,
  namePlaceholder,
  xPlaceholder,
  yPlaceholder,
  doorPositionPlaceholder,
  bayCountPlaceholder,
  onChange,
  onRemove,
  children,
}: GreenhouseRowProps) {
  const hasErrors = errors != null && Object.keys(errors).length > 0;
  const title = row.name.trim() || `${greenhouseLabel} ${index + 1}`;
  const summary =
    row.xDimension > 0 && row.yDimension > 0
      ? `${row.xDimension} × ${row.yDimension} m`
      : null;

  return (
    <div
      className={cn(
        'bg-muted/30 rounded-lg border',
        hasErrors ? 'border-destructive/60' : 'border-border/60',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1 py-1 pr-2 pl-1',
          expanded && 'border-border/40 border-b',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-left"
        >
          <ChevronRight
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              expanded && 'rotate-90',
            )}
          />
          <span className="truncate text-sm font-medium">{title}</span>
          {summary && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {summary}
            </span>
          )}
          {hasErrors && (
            <AlertCircle className="text-destructive h-3.5 w-3.5 shrink-0" />
          )}
        </button>
        <WriteActionButton
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0 p-0"
          disabled={disabled}
          aria-label={`Delete ${title}`}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </WriteActionButton>
      </div>

      {expanded && (
        <>
          <GreenhouseRowFields
            row={row}
            index={index}
            disabled={disabled}
            errors={errors}
            nameLabel={nameLabel}
            xLabel={xLabel}
            yLabel={yLabel}
            doorLabel={doorLabel}
            bayCountLabel={bayCountLabel}
            namePlaceholder={namePlaceholder}
            xPlaceholder={xPlaceholder}
            yPlaceholder={yPlaceholder}
            doorPositionPlaceholder={doorPositionPlaceholder}
            bayCountPlaceholder={bayCountPlaceholder}
            onChange={onChange}
          />

          {hasErrors && (
            <div className="space-y-1 px-4 pb-3">
              {errors?.name && (
                <p className="text-destructive text-xs">{errorMessages.name}</p>
              )}
              {errors?.dimensions && (
                <p className="text-destructive text-xs">
                  {errorMessages.dimensions}
                </p>
              )}
              {errors?.bayCount && (
                <p className="text-destructive text-xs">
                  {errorMessages.bayCount}
                </p>
              )}
            </div>
          )}

          <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`gh-horizontal-${index}`}
                checked={row.isHorizontal ?? false}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onChange(index, { isHorizontal: checked === true })
                }
              />
              <label
                htmlFor={`gh-horizontal-${index}`}
                className="text-muted-foreground cursor-pointer text-xs font-medium select-none"
              >
                {orientationLabel}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label
                  htmlFor={`gh-visible-${index}`}
                  className="cursor-pointer text-xs font-medium select-none"
                >
                  {visibilityLabel}
                </label>
                <span className="text-muted-foreground text-[11px]">
                  {visibilityHint}
                </span>
              </div>
              <Switch
                id={`gh-visible-${index}`}
                checked={row.hiddenInFarmOverview !== true}
                disabled={disabled}
                aria-label={visibilityLabel}
                onCheckedChange={(checked) =>
                  onChange(index, { hiddenInFarmOverview: !checked })
                }
              />
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
}
