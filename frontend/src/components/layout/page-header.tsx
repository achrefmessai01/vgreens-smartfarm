'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight dark:text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted-foreground text-sm dark:text-white">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
