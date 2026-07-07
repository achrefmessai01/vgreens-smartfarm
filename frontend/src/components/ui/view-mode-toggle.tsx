'use client';

import { Button } from '@/components/ui/button';
import type { ListViewMode } from '@/lib/hooks/use-list-view-mode';
import { cn } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';

interface ViewModeToggleProps {
  value: ListViewMode;
  onChange: (value: ListViewMode) => void;
  /** Localized aria-labels so screen readers announce the buttons. */
  labels: {
    list: string;
    grid: string;
  };
  className?: string;
}

/**
 * Two-button segmented toggle for switching a list surface between the
 * list (default) and grid card views. Generic across admin tables — the
 * caller supplies the current mode + a setter (typically from
 * `useListViewMode`) and the localized labels for a11y.
 */
export function ViewModeToggle({
  value,
  onChange,
  labels,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      role="group"
      className={cn(
        'border-border/60 bg-background inline-flex items-center gap-1 rounded-lg border p-1',
        className,
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-pressed={value === 'list'}
        aria-label={labels.list}
        onClick={() => onChange('list')}
        className={cn(
          'h-7 w-8 rounded-md',
          value === 'list'
            ? 'bg-muted text-foreground hover:bg-muted'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-pressed={value === 'grid'}
        aria-label={labels.grid}
        onClick={() => onChange('grid')}
        className={cn(
          'h-7 w-8 rounded-md',
          value === 'grid'
            ? 'bg-muted text-foreground hover:bg-muted'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
