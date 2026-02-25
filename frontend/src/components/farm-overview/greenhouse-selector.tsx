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
    <div className="flex w-full bg-muted/10 border-b border-border/40">
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
              flex-1 justify-center border-x border-border/20 first:border-l-0
              text-xs font-semibold tracking-wider uppercase shadow-none cursor-pointer
              h-10 px-6
              ${index === 0 ? 'rounded-l-md rounded-r-none' : 'rounded-r-md rounded-l-none'}
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
