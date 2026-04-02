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
    <div className="border-border/40 bg-muted/10 flex w-full min-w-0 flex-wrap border-b">
      {options.map((option, index) => {
        const isActive = value === index;
        return (
          <Button
            key={option.key}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onValueChange(index)}
            className={`border-border/20 h-auto min-w-0 cursor-pointer justify-center border-x px-2 py-2 text-center text-[10px] leading-tight font-semibold tracking-[0.14em] whitespace-normal shadow-none sm:h-10 sm:flex-1 sm:px-6 sm:text-xs sm:tracking-wider sm:whitespace-nowrap ${index === 0 ? 'rounded-l-md rounded-r-none' : index === options.length - 1 ? 'rounded-l-none rounded-r-md' : 'rounded-none'} ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-muted/10 text-muted-foreground hover:bg-primary hover:text-primary-foreground'
            } `}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
