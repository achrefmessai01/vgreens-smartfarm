'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

export interface DateRangePickerProps {
  dateFrom: Date | null;
  dateTo: Date | null;
  onRangeChange: (from: Date | null, to: Date | null) => void;
  placeholder?: string;
  className?: string;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onRangeChange,
  placeholder,
  className,
}: DateRangePickerProps) {
  const { t } = useI18n();

  placeholder = placeholder ?? t.common.selectDateRange;

  const [open, setOpen] = React.useState(false);
  const [fromInput, setFromInput] = React.useState(
    dateFrom ? dateFrom.toISOString().slice(0, 10) : '',
  );
  const [toInput, setToInput] = React.useState(
    dateTo ? dateTo.toISOString().slice(0, 10) : '',
  );

  React.useEffect(() => {
    setFromInput(dateFrom ? dateFrom.toISOString().slice(0, 10) : '');
    setToInput(dateTo ? dateTo.toISOString().slice(0, 10) : '');
  }, [dateFrom, dateTo]);

  const handleApply = () => {
    const from = fromInput ? new Date(fromInput + 'T00:00:00') : null;
    const to = toInput ? new Date(toInput + 'T23:59:59') : null;
    onRangeChange(from, to);
    setOpen(false);
  };

  const handleClear = () => {
    setFromInput('');
    setToInput('');
    onRangeChange(null, null);
    setOpen(false);
  };

  const label =
    dateFrom && dateTo
      ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
      : dateFrom
        ? `From ${formatDate(dateFrom)}`
        : dateTo
          ? `Until ${formatDate(dateTo)}`
          : placeholder;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-border/60 bg-muted/30 hover:bg-muted/50 text-muted-foreground h-9 min-w-[200px] justify-start gap-1.5 rounded-lg px-3 font-normal',
            className,
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto rounded-xl p-4" align="end">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                From
              </label>
              <input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                To
              </label>
              <input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
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
  );
}
