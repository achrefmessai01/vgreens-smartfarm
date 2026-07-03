'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DoorPosition as DoorPositionEnum } from '@/generated/graphql';
import type {
  GreenhouseRowData,
  GreenhouseRowErrors,
} from './use-farm-layout-config';

// Door-position select options derived from the GraphQL enum so adding a new
// position only requires a schema update — no manual list to maintain.
const DOOR_POSITION_OPTIONS = Object.entries(DoorPositionEnum).map(
  ([key, value]) => ({
    value,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
  }),
);

interface GreenhouseRowFieldsProps {
  row: GreenhouseRowData;
  index: number;
  disabled: boolean;
  errors?: GreenhouseRowErrors;
  nameLabel: string;
  xLabel: string;
  yLabel: string;
  doorLabel: string;
  bayCountLabel: string;
  namePlaceholder: string;
  xPlaceholder: string;
  yPlaceholder: string;
  doorPositionPlaceholder: string;
  bayCountPlaceholder: string;
  onChange: (index: number, patch: Partial<GreenhouseRowData>) => void;
}

export function GreenhouseRowFields({
  row,
  index,
  disabled,
  errors,
  nameLabel,
  xLabel,
  yLabel,
  doorLabel,
  bayCountLabel,
  namePlaceholder,
  xPlaceholder,
  yPlaceholder,
  doorPositionPlaceholder,
  bayCountPlaceholder,
  onChange,
}: GreenhouseRowFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
      <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
        <label className="text-muted-foreground text-xs font-medium">
          {nameLabel}
        </label>
        <Input
          placeholder={namePlaceholder}
          value={row.name}
          disabled={disabled}
          aria-invalid={errors?.name || undefined}
          onChange={(e) => onChange(index, { name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-xs font-medium">
          {xLabel}
        </label>
        <Input
          type="number"
          min={0}
          step="0.1"
          placeholder={xPlaceholder}
          value={row.xDimension}
          disabled={disabled}
          aria-invalid={errors?.dimensions || undefined}
          onChange={(e) =>
            onChange(index, { xDimension: Number(e.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-xs font-medium">
          {yLabel}
        </label>
        <Input
          type="number"
          min={0}
          step="0.1"
          placeholder={yPlaceholder}
          value={row.yDimension}
          disabled={disabled}
          aria-invalid={errors?.dimensions || undefined}
          onChange={(e) =>
            onChange(index, { yDimension: Number(e.target.value) })
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-muted-foreground text-xs font-medium">
          {bayCountLabel}
        </label>
        <Input
          type="number"
          min={1}
          step="1"
          placeholder={bayCountPlaceholder}
          value={row.bayCount ?? ''}
          disabled={disabled}
          aria-invalid={errors?.bayCount || undefined}
          onChange={(e) =>
            onChange(index, {
              bayCount:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
      </div>

      <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
        <label className="text-muted-foreground text-xs font-medium">
          {doorLabel}
        </label>
        <Select
          value={row.doorPosition ?? ''}
          onValueChange={(value) =>
            onChange(index, { doorPosition: value as DoorPositionEnum })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={doorPositionPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {DOOR_POSITION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
