'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DoorPosition as DoorPositionEnum,
  type GreenhouseInput,
} from '@/generated/graphql';

const DOOR_POSITION_OPTIONS = Object.entries(DoorPositionEnum).map(
  ([key, value]) => ({
    value,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
  }),
);

interface GreenhouseRowProps {
  row: GreenhouseInput;
  index: number;
  disabled: boolean;
  greenhouseLabel: string;
  nameLabel: string;
  xLabel: string;
  yLabel: string;
  doorLabel: string;
  namePlaceholder: string;
  xPlaceholder: string;
  yPlaceholder: string;
  doorPositionPlaceholder: string;
  onChange: (index: number, patch: Partial<GreenhouseInput>) => void;
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
  namePlaceholder,
  xPlaceholder,
  yPlaceholder,
  doorPositionPlaceholder,
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

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <label className="text-muted-foreground text-xs font-medium">
            {nameLabel}
          </label>
          <Input
            placeholder={namePlaceholder}
            value={row.name}
            disabled={disabled}
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
            onChange={(e) =>
              onChange(index, { yDimension: Number(e.target.value) })
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
    </div>
  );
}
