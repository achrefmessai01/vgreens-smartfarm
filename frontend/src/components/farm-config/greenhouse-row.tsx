'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GreenhouseInput } from '@/generated/graphql';

interface GreenhouseRowProps {
  row: GreenhouseInput;
  index: number;
  disabled: boolean;
  namePlaceholder: string;
  xPlaceholder: string;
  yPlaceholder: string;
  onChange: (index: number, patch: Partial<GreenhouseInput>) => void;
  onRemove: (index: number) => void;
}

export function GreenhouseRow({
  row,
  index,
  disabled,
  namePlaceholder,
  xPlaceholder,
  yPlaceholder,
  onChange,
  onRemove,
}: GreenhouseRowProps) {
  return (
    <div className="grid grid-cols-12 gap-2 rounded-md border p-3">
      <Input
        className="col-span-12 md:col-span-5"
        placeholder={namePlaceholder}
        value={row.name}
        onChange={(e) => onChange(index, { name: e.target.value })}
      />
      <Input
        className="col-span-6 md:col-span-3"
        type="number"
        min={0}
        step="0.1"
        placeholder={xPlaceholder}
        value={row.xDimension}
        onChange={(e) => onChange(index, { xDimension: Number(e.target.value) })}
      />
      <Input
        className="col-span-6 md:col-span-3"
        type="number"
        min={0}
        step="0.1"
        placeholder={yPlaceholder}
        value={row.yDimension}
        onChange={(e) => onChange(index, { yDimension: Number(e.target.value) })}
      />
      <Button
        type="button"
        variant="ghost"
        className="col-span-12 md:col-span-1"
        disabled={disabled}
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
