'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function PageHeader({
  title,
  subtitle,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-1', className)} {...props}>
      <h1 className="text-foreground text-2xl font-semibold tracking-tight dark:text-white">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-muted-foreground text-sm dark:text-white">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
