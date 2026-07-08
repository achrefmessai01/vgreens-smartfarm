'use client';

import { Button } from '@/components/ui/button';
import type { UsersViewMode } from '@/lib/hooks/use-users-view-mode';
import { cn } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';

interface UserViewToggleProps {
  value: UsersViewMode;
  onChange: (value: UsersViewMode) => void;
  /** Localized aria-labels so screen readers announce the buttons. */
  labels: {
    list: string;
    grid: string;
  };
  className?: string;
}

/**
 * Two-button segmented toggle for switching the users surface between the
 * list (default) and grid card views. Sits in the shared users toolbar
 * next to filters. Kept intentionally minimal and identical in shape to
 * `TenantViewToggle` so the two admin tables read the same.
 */
export function UserViewToggle({
  value,
  onChange,
  labels,
  className,
}: UserViewToggleProps) {
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
