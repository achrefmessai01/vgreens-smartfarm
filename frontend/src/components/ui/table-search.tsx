'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TableSearchProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TableSearch({
  placeholder = 'Search...',
  value,
  onChange,
  className,
}: TableSearchProps) {
  return (
    <div className={cn('relative flex-1 min-w-0 max-w-md', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 rounded-lg border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
      />
    </div>
  )
}
