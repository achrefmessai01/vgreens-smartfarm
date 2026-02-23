'use client';

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
    <div className="flex bg-muted/20 dark:bg-muted/5 pt-2">
      {options.map((option, index) => {
        const isActive = value === index;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onValueChange(index)}
            className={`
              relative px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300
               border-t border-x border-transparent rounded-sm
              ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary/50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]'
                  : 'bg-background dark:bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-muted-foreground/30 hover:shadow-[0_-2px_8px_rgba(0,0,0,0.15)] hover:scale-[1.02] hover:-translate-y-0.5'
              }
            `}
          >
            {option.label}
            {/* This hides the bottom border of the container when active to create the "Folder" look */}
            {isActive && (
              <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-background z-10" />
            )}
          </button>
        );
      })}
    </div>
  );
}
