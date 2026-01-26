'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface StyledSelectOption {
  label: string
  value: string
}

export interface StyledSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: StyledSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  disabled?: boolean
  width?: string
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
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'dark:border-border/50 dark:text-white dark:bg-card',
          triggerClassName
        )}
        style={width !== 'auto' ? { width } : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn('dark:bg-card dark:border-border/50', contentClassName)}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={cn(
              'dark:text-white dark:hover:bg-muted/70',
              itemClassName
            )}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
