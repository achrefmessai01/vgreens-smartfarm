'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StyledSelect } from '@/components/ui/styled-select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CirclePlus, ChevronRight, RotateCcw } from 'lucide-react';

export interface TableFilterCategory {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
  multiSelect?: boolean;
}

export interface TableFiltersPopoverProps {
  categories: TableFilterCategory[];
  onClearAll?: () => void;
  className?: string;
}

function isActive(cat: TableFilterCategory): boolean {
  if (cat.multiSelect) return cat.value !== '';
  const first = cat.options[0]?.value ?? '';
  return cat.value !== '' && cat.value !== first;
}

function MultiSelectOptions({
  value,
  options,
  onFilterChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onFilterChange: (value: string) => void;
}) {
  const selected = React.useMemo(
    () =>
      new Set(
        value
          ? value
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
      ),
    [value],
  );
  const toggle = (optionValue: string) => {
    const next = new Set(selected);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onFilterChange(Array.from(next).join(','));
  };
  return (
    <div className="flex flex-col gap-2 py-1">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="text-foreground hover:bg-muted/50 -mx-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Checkbox
            checked={selected.has(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            aria-label={opt.label}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export function TableFiltersPopover({
  categories,
  onClearAll,
  className,
}: TableFiltersPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [expandedLabel, setExpandedLabel] = React.useState<string | null>(null);

  const activeCount = categories.filter(isActive).length;

  const toggleExpanded = (label: string) => {
    setExpandedLabel((prev) => (prev === label ? null : label));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-input bg-background hover:bg-muted/50 h-9 gap-1.5 rounded-full px-4',
            className,
          )}
        >
          <CirclePlus className="h-4 w-4" aria-hidden />
          <span>Filter</span>
          {activeCount > 0 && (
            <span
              className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium"
              aria-hidden
            >
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 overflow-hidden rounded-xl p-0"
        sideOffset={8}
      >
        <div className="max-h-[min(70vh,400px)] overflow-y-auto">
          {categories.map((cat) => {
            const isExpanded = expandedLabel === cat.label;
            return (
              <div
                key={cat.label}
                className="border-border/40 border-b last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(cat.label)}
                  className={cn(
                    'text-foreground hover:bg-muted/50 flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium transition-colors',
                    isExpanded && 'bg-muted/30',
                  )}
                >
                  <span>{cat.label}</span>
                  <ChevronRight
                    className={cn(
                      'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
                      isExpanded && 'rotate-90',
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pt-0 pb-3">
                    {cat.multiSelect ? (
                      <MultiSelectOptions
                        value={cat.value}
                        options={cat.options}
                        onFilterChange={cat.onFilterChange}
                      />
                    ) : (
                      <StyledSelect
                        value={cat.value}
                        onValueChange={cat.onFilterChange}
                        options={cat.options}
                        width="100%"
                        triggerClassName="h-9 rounded-md w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {activeCount > 0 && onClearAll && (
          <div className="border-border/60 border-t p-2">
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setOpen(false);
              }}
              className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
