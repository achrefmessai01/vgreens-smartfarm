'use client';

import { Button } from '@/components/ui/button';

interface GreenhouseSelectorProps {
  value: number;
  onValueChange: (index: number) => void;
  options: { label: string; key: string }[];
}

export function GreenhouseSelector({
  value,
  onValueChange,
  options,
}: GreenhouseSelectorProps) {
  return (
    <div className="grid w-full min-w-0 grid-cols-3 border-b border-border/40 bg-muted/10 sm:flex">
      {options.map((option, index) => {
        const isActive = value === index;
        return (
          <Button
            key={option.key}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onValueChange(index)}
            className={`
              min-w-0 justify-center border-x border-border/20 text-center shadow-none cursor-pointer
              h-auto px-2 py-2 text-[10px] font-semibold leading-tight tracking-[0.14em] uppercase whitespace-normal
              sm:flex-1 sm:h-10 sm:px-6 sm:text-xs sm:tracking-wider sm:whitespace-nowrap
              ${index === 0 ? 'rounded-l-md rounded-r-none' : index === options.length - 1 ? 'rounded-r-md rounded-l-none' : 'rounded-none'}
              ${
                isActive
                  ? 'bg-emerald-400 text-white'
                  : 'bg-muted/10 text-muted-foreground hover:bg-primary hover:text-primary-foreground'
              }
            `}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
