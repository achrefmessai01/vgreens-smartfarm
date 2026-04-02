'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ViewMode = 'heatmap' | 'discrete' | 'graph';

interface ViewModeSelectorProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  heatmapLabel: string;
  discreteLabel: string;
  graphLabel?: string;
  showGraphOption?: boolean;
}

export function ViewModeSelector({
  value,
  onValueChange,
  heatmapLabel,
  discreteLabel,
  graphLabel = 'Graph',
  showGraphOption = false,
}: ViewModeSelectorProps) {
  const modes: { key: ViewMode; label: string; visible: boolean }[] = [
    { key: 'heatmap', label: heatmapLabel, visible: true },
    { key: 'discrete', label: discreteLabel, visible: true },
    { key: 'graph', label: graphLabel, visible: showGraphOption },
  ];

  const visibleModes = modes.filter((m) => m.visible);

  return (
    <div
      className={cn(
        'bg-muted/40 dark:bg-muted/20 grid w-full min-w-0 gap-1 rounded-2xl p-1',
        visibleModes.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
        'sm:inline-flex sm:w-auto sm:grid-cols-none sm:items-center sm:rounded-full sm:p-0.5',
      )}
    >
      {visibleModes.map((mode) => {
        const isActive = value === mode.key;
        return (
          <Button
            key={mode.key}
            type="button"
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onValueChange(mode.key)}
            className="h-6 rounded-xl text-sm leading-tight font-medium"
          >
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
}
