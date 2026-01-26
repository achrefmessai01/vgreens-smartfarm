'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

export function PageHeader({
  title,
  subtitle,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-1', className)} {...props}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm text-muted-foreground dark:text-white">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
