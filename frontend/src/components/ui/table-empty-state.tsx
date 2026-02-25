'use client'

import { Inbox } from 'lucide-react'

export interface TableEmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function TableEmptyState({
  title,
  description,
  action,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-base font-medium text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
