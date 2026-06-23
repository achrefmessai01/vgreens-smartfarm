'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { GreenhouseRowFields } from './greenhouse-row-fields';
import type { GreenhouseRowData } from './use-farm-layout-config';

interface GreenhouseRowProps {
  row: GreenhouseRowData;
  index: number;
  disabled: boolean;
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
}

export function GreenhouseRow({
  row,
  index,
  disabled,
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
}: GreenhouseRowProps) {
  return (
    <div className="bg-muted/30 border-border/60 rounded-lg border">
      <div className="border-border/40 flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-sm font-medium">
          {greenhouseLabel} {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive -mr-1 h-7 w-7 p-0"
          disabled={disabled}
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <GreenhouseRowFields
        row={row}
        index={index}
        disabled={disabled}
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
    </div>
  );
}
