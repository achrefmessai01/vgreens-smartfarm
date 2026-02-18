'use client'


interface GreenhouseSelectorProps {
  value: number
  onValueChange: (index: number) => void
  options: { label: string; key: string }[]
}

export function GreenhouseSelector({
  value,
  onValueChange,
  options,
}: GreenhouseSelectorProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      {options.map((option, index) => {
        const isActive = value === index
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onValueChange(index)}
            className={`
              relative px-6 py-3.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap
              border-b-2 -mb-px min-w-[120px] sm:min-w-[140px]
              ${
                isActive
                  ? 'border-primary text-primary dark:text-primary bg-background/60 dark:bg-background/40'
                  : 'border-transparent text-muted-foreground dark:text-muted-foreground/80 hover:text-foreground dark:hover:text-foreground hover:bg-muted/30 dark:hover:bg-muted/20'
              }
            `}
          >
            {option.label}
            {isActive && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/20 dark:bg-primary/30" />
            )}
          </button>
        )
      })}
    </div>
  )
}
