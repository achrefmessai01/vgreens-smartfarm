'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const EMPTY_VALUE_SENTINEL = '__empty__';

function toSelectValue(v: string): string {
  return v === '' ? EMPTY_VALUE_SENTINEL : v;
}

function fromSelectValue(v: string): string {
  return v === EMPTY_VALUE_SENTINEL ? '' : v;
}

export interface StyledSelectOption {
  label: string;
  value: string;
}

export interface StyledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  disabled?: boolean;
  width?: string;
}

export function StyledSelect({
  value,
  onValueChange,
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  itemClassName,
  disabled,
  width = 'auto',
}: StyledSelectProps) {
  const selectValue = toSelectValue(value);

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onValueChange(fromSelectValue(v))}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'dark:border-border/50 dark:bg-card dark:text-white',
          triggerClassName,
        )}
        style={width !== 'auto' ? { width } : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn('dark:bg-card dark:border-border/50', contentClassName)}
      >
        {options.map((option) => {
          const itemValue = toSelectValue(option.value);
          return (
            <SelectItem
              key={itemValue}
              value={itemValue}
              className={cn(
                'dark:hover:bg-muted/70 dark:text-white',
                itemClassName,
              )}
            >
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
