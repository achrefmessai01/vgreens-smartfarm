'use client';

import { Inbox } from 'lucide-react';

export interface TableEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmptyState({
  title,
  description,
  action,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative mb-6">
        <div className="from-primary/10 to-primary/5 absolute inset-0 rounded-full bg-gradient-to-br blur-2xl" />
        <div className="border-border/40 bg-muted/40 relative rounded-full border p-6 shadow-inner backdrop-blur-sm">
          <Inbox className="text-muted-foreground/50 h-10 w-10" />
        </div>
      </div>

      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>

      {description && (
        <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
