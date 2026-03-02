'use client';

import { StyledSelect } from '@/components/ui/styled-select';
import type { ParameterType } from '@/lib/farm-types';

interface ParameterSelectorProps {
  value: ParameterType;
  onValueChange: (value: ParameterType) => void;
  options: { label: string; value: string }[];
}

export function ParameterSelector({
  value,
  onValueChange,
  options,
}: ParameterSelectorProps) {
  return (
    <>
      <div className="sm:hidden">
        <StyledSelect
          value={value}
          onValueChange={(nextValue) => onValueChange(nextValue as ParameterType)}
          options={options}
          width="100%"
          triggerClassName="h-10 w-full rounded-md border-border/40 bg-background px-3 text-xs font-semibold"
        />
      </div>

      <div className="hidden min-w-0 flex-wrap items-center gap-2 border-b border-border/40 pb-1 sm:flex sm:gap-0 sm:pb-0">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onValueChange(option.value as ParameterType)}
              className={`
                relative min-w-0 rounded-none border-x-0 border-t-0 border-b-2 px-4 py-2 text-xs font-semibold tracking-wide whitespace-nowrap
                transition-colors duration-150
                ${
                  isActive
                    ? 'border-emerald-400 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
