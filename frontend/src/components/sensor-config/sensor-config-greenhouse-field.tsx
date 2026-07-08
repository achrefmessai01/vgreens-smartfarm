'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

interface GreenhouseOption {
  id: string;
  name: string;
}

interface SensorConfigGreenhouseFieldProps {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly GreenhouseOption[];
  loading: boolean;
  /** Shown inside the dropdown when the tenant has no greenhouses configured. */
  emptyMessage: string;
}

/**
 * Labeled greenhouse dropdown with a "no greenhouses configured" empty state
 * inside the popover. Split out of the form-fields file to respect the
 * repo-wide 150-line component limit.
 */
export function SensorConfigGreenhouseField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  options,
  loading,
  emptyMessage,
}: SensorConfigGreenhouseFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor="field-greenhouse"
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        <Building2 className="text-muted-foreground h-3.5 w-3.5" />
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="field-greenhouse" className="h-9 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              {emptyMessage}
            </div>
          ) : (
            options.map((gh) => (
              <SelectItem key={gh.id} value={gh.id}>
                {gh.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-xs">{hint}</p>
    </div>
  );
}
