'use client';

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
    <div className="flex gap-0 border-b border-border/40">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value as ParameterType)}
            className={`
              relative px-4 py-2 text-xs font-semibold tracking-wide
              transition-colors duration-150
              ${
                isActive
                  ? 'text-foreground border-b-2 border-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
