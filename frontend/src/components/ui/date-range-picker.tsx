'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateRangePickerProps {
  dateFrom: Date | null
  dateTo: Date | null
  onRangeChange: (from: Date | null, to: Date | null) => void
  placeholder?: string
  className?: string
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onRangeChange,
  placeholder = 'Select date range',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [fromInput, setFromInput] = React.useState(
    dateFrom ? dateFrom.toISOString().slice(0, 10) : ''
  )
  const [toInput, setToInput] = React.useState(
    dateTo ? dateTo.toISOString().slice(0, 10) : ''
  )

  React.useEffect(() => {
    setFromInput(dateFrom ? dateFrom.toISOString().slice(0, 10) : '')
    setToInput(dateTo ? dateTo.toISOString().slice(0, 10) : '')
  }, [dateFrom, dateTo])

  const handleApply = () => {
    const from = fromInput ? new Date(fromInput + 'T00:00:00') : null
    const to = toInput ? new Date(toInput + 'T23:59:59') : null
    onRangeChange(from, to)
    setOpen(false)
  }

  const handleClear = () => {
    setFromInput('')
    setToInput('')
    onRangeChange(null, null)
    setOpen(false)
  }

  const label =
    dateFrom && dateTo
      ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
      : dateFrom
        ? `From ${formatDate(dateFrom)}`
        : dateTo
          ? `Until ${formatDate(dateTo)}`
          : placeholder

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'rounded-lg h-9 px-3 border-border/60 bg-muted/30 hover:bg-muted/50 gap-1.5 min-w-[200px] justify-start text-muted-foreground font-normal',
            className
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto p-4 rounded-xl" align="end">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                From
              </label>
              <input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                To
              </label>
              <input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
