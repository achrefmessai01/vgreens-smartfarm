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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="bg-muted/50 mb-4 rounded-full p-4">
        <Inbox className="text-muted-foreground h-8 w-8" />
      </div>
      <p className="text-foreground mb-1 text-base font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
