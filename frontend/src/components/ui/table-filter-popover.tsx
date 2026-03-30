'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StyledSelect } from '@/components/ui/styled-select';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

export interface TableFilterConfig {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
  multiSelect?: boolean;
}

export interface TableFilterPopoverProps {
  filterConfig: TableFilterConfig;
  onClear?: () => void;
  className?: string;
}

export function TableFilterPopover({
  filterConfig,
  onClear,
  className,
}: TableFilterPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const hasActiveFilter =
    filterConfig.value !== '' &&
    (filterConfig.options[0]?.value !== filterConfig.value ||
      filterConfig.options.length === 0);
  const filterCount = hasActiveFilter ? 1 : 0;

  const handleClear = () => {
    const firstValue = filterConfig.options[0]?.value ?? '';
    filterConfig.onFilterChange(firstValue);
    onClear?.();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-border/60 bg-muted/30 hover:bg-muted/50 h-9 gap-1.5 rounded-full px-4',
            className,
          )}
        >
          <Filter className="h-4 w-4" aria-hidden />
          <span>Filter</span>
          {filterCount > 0 && (
            <span
              className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
              aria-hidden
            >
              {filterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 rounded-xl p-3"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground text-sm font-medium">
              {filterConfig.label}
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          <StyledSelect
            value={filterConfig.value}
            onValueChange={filterConfig.onFilterChange}
            options={filterConfig.options}
            width="100%"
            triggerClassName="h-9 rounded-md w-full"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
