'use client';

import * as React from 'react';
import { CalendarRange, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { DeviceStatusRange } from '@/generated/graphql';
import type { CustomRange } from '@/lib/hooks/use-device-dashboard';
import { RANGE_PRESETS } from './device-status-constants';

interface DeviceTimeFilterProps {
  range: DeviceStatusRange;
  onRangeChange: (range: DeviceStatusRange) => void;
  customRange: CustomRange | null;
  onCustomApply: (range: CustomRange) => void;
  onCustomClear: () => void;
}

/** `YYYY-MM-DDTHH:mm` (local) — the format `<input type="datetime-local">` expects. */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtRange(r: CustomRange): string {
  const f = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${f.format(r.from)} → ${f.format(r.to)}`;
}

const inputClass =
  'border-input bg-background/60 text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs backdrop-blur-sm outline-none focus-visible:ring-[3px]';

/** Combined time selector: relative presets + a custom from/to datetime range. */
export function DeviceTimeFilter({
  range,
  onRangeChange,
  customRange,
  onCustomApply,
  onCustomClear,
}: DeviceTimeFilterProps) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;
  const [open, setOpen] = React.useState(false);
  const [fromInput, setFromInput] = React.useState(
    customRange ? toDatetimeLocal(customRange.from) : '',
  );
  const [toInput, setToInput] = React.useState(
    customRange ? toDatetimeLocal(customRange.to) : '',
  );

  React.useEffect(() => {
    if (customRange) {
      setFromInput(toDatetimeLocal(customRange.from));
      setToInput(toDatetimeLocal(customRange.to));
    }
  }, [customRange]);

  const presetLabel: Record<DeviceStatusRange, string> = {
    [DeviceStatusRange.OneDay]: ds.period.oneDay,
    [DeviceStatusRange.SevenDays]: ds.period.sevenDays,
    [DeviceStatusRange.OneMonth]: ds.period.oneMonth,
    [DeviceStatusRange.SixMonths]: ds.period.sixMonths,
    [DeviceStatusRange.OneYear]: ds.period.oneYear,
  };

  const validation = React.useMemo(() => {
    if (!fromInput || !toInput)
      return { ok: false, error: null as string | null };
    const from = new Date(fromInput);
    const to = new Date(toInput);
    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      from >= to
    ) {
      return { ok: false, error: ds.customRange.invalid, from, to };
    }
    return { ok: true, error: null as string | null, from, to };
  }, [fromInput, toInput, ds.customRange.invalid]);

  const handlePreset = (preset: DeviceStatusRange) => {
    onRangeChange(preset);
    setOpen(false);
  };

  const handleApply = () => {
    if (!validation.ok || !validation.from || !validation.to) return;
    onCustomApply({ from: validation.from, to: validation.to });
    setOpen(false);
  };

  const handleClear = () => {
    setFromInput('');
    setToInput('');
    onCustomClear();
  };

  const triggerLabel = customRange ? fmtRange(customRange) : presetLabel[range];
  const TriggerIcon = customRange ? CalendarRange : Clock;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 gap-2 backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md',
            customRange
              ? 'border-[#016f7c]/50 bg-[#016f7c]/10 text-[#016f7c] dark:text-teal-200'
              : 'bg-card/60',
          )}
          aria-label={ds.period.ariaLabel}
        >
          <TriggerIcon className="h-4 w-4" />
          <span className="max-w-[14rem] truncate text-xs font-medium">
            {triggerLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="bg-card/80 w-[20rem] rounded-xl p-1.5 backdrop-blur-md"
      >
        <DropdownMenuLabel className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          {ds.period.ariaLabel}
        </DropdownMenuLabel>
        {RANGE_PRESETS.map((preset) => {
          const active = !customRange && range === preset;
          return (
            <DropdownMenuItem
              key={preset}
              onSelect={(e) => {
                e.preventDefault();
                handlePreset(preset);
              }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm',
                active && 'bg-[#016f7c]/10 text-[#016f7c] dark:text-teal-200',
              )}
            >
              <span className="flex items-center gap-2">
                <Clock
                  className={cn(
                    'h-3.5 w-3.5',
                    active
                      ? 'text-[#016f7c] dark:text-teal-300'
                      : 'text-muted-foreground',
                  )}
                />
                <span>{presetLabel[preset]}</span>
              </span>
              {active && (
                <Check className="h-4 w-4 text-[#016f7c] dark:text-teal-300" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2 px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          <CalendarRange className="h-3.5 w-3.5" />
          {ds.customRange.title}
        </DropdownMenuLabel>
        <div
          className="space-y-2 px-2 pb-1"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <label className="block space-y-1">
            <span className="text-muted-foreground block text-xs">
              {ds.customRange.from}
            </span>
            <input
              type="datetime-local"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-muted-foreground block text-xs">
              {ds.customRange.to}
            </span>
            <input
              type="datetime-local"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className={inputClass}
            />
          </label>
          {validation.error && (
            <p className="text-destructive text-xs" role="alert">
              {validation.error}
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={handleClear}
              disabled={!fromInput && !toInput && !customRange}
            >
              {ds.customRange.clear}
            </Button>
            <Button
              size="sm"
              className="group relative h-8 overflow-hidden bg-gradient-to-br from-[#016f7c] to-[#015862] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              onClick={handleApply}
              disabled={!validation.ok}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              {ds.customRange.apply}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
