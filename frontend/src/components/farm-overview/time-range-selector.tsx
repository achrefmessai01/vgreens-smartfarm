'use client';

import * as React from 'react';
import { CalendarRange, Check, Clock, Loader2 } from 'lucide-react';
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
import {
  TIME_RANGE_PRESETS,
  type TimeRangePreset,
  type TimeRangeValue,
  useFarmOverviewTimeRange,
} from '@/lib/hooks/use-farm-overview-time-range';

export interface TimeRangeSelectorProps {
  /** Optional spinner-on-trigger flag for callers that own a recalc state. */
  loading?: boolean;
  className?: string;
}

/** `YYYY-MM-DDTHH:mm` (local) — the format `<input type="datetime-local">` expects. */
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Compact form for the badge on the trigger ("5m", "24h", "Custom"). */
function shortRangeBadge(value: TimeRangeValue): string {
  if (value.kind === 'custom') return '…';
  switch (value.preset) {
    case '5m':
      return '5m';
    case '1h':
      return '1h';
    case '24h':
      return '24h';
    case '7d':
      return '7d';
    case '30d':
      return '30d';
    case '90d':
      return '90d';
    case 'ytd':
      return 'YTD';
  }
}

function formatRangeLabel(
  value: TimeRangeValue,
  presetLabels: Record<TimeRangePreset, string>,
): string {
  if (value.kind === 'preset') return presetLabels[value.preset];
  const fmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fmt.format(value.from)} → ${fmt.format(value.to)}`;
}

const datetimeInputClass =
  'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

export function TimeRangeSelector({
  loading,
  className,
}: TimeRangeSelectorProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.timeRangePresets;
  const { value, setValue } = useFarmOverviewTimeRange();

  const presetLabels: Record<TimeRangePreset, string> = {
    '5m': labels.last5min,
    '1h': labels.last1h,
    '24h': labels.last24h,
    '7d': labels.last7d,
    '30d': labels.last30d,
    '90d': labels.last90d,
    ytd: labels.ytd,
  };

  const [open, setOpen] = React.useState(false);

  const initial = value.kind === 'custom' ? value : null;
  const [fromInput, setFromInput] = React.useState(
    initial ? toDatetimeLocalValue(initial.from) : '',
  );
  const [toInput, setToInput] = React.useState(
    initial ? toDatetimeLocalValue(initial.to) : '',
  );

  React.useEffect(() => {
    if (value.kind === 'custom') {
      setFromInput(toDatetimeLocalValue(value.from));
      setToInput(toDatetimeLocalValue(value.to));
    }
  }, [value]);

  const customExpanded =
    fromInput !== '' || toInput !== '' || value.kind === 'custom';

  const validation = React.useMemo<{
    ok: boolean;
    error: string | null;
    from?: Date;
    to?: Date;
  }>(() => {
    if (!fromInput || !toInput) return { ok: false, error: null };
    const from = new Date(fromInput);
    const to = new Date(toInput);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return { ok: false, error: labels.invalidRange };
    }
    if (from >= to) return { ok: false, error: labels.invalidRange };
    return { ok: true, error: null, from, to };
  }, [fromInput, toInput, labels.invalidRange]);

  const handleApply = () => {
    if (!validation.ok || !validation.from || !validation.to) return;
    // `Date.now()` is impure (react-hooks/purity); keep this check out of
    // the render-time memo.
    if (validation.to.getTime() > Date.now() + 60_000) return;
    setValue({ kind: 'custom', from: validation.from, to: validation.to });
    setOpen(false);
  };

  const handleClear = () => {
    setFromInput('');
    setToInput('');
  };

  const handlePreset = (preset: TimeRangePreset) => {
    setValue({ kind: 'preset', preset });
    setOpen(false);
  };

  const triggerLabel = formatRangeLabel(value, presetLabels);
  const isCustom = value.kind === 'custom';
  const TriggerIcon = isCustom ? CalendarRange : Clock;
  const badge = shortRangeBadge(value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'group relative h-9 gap-2 overflow-hidden rounded-lg border px-1 pr-1 pl-3 shadow-sm backdrop-blur-sm transition-all duration-200',
            'hover:-translate-y-px hover:shadow-md',
            'data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-sky-400/30',
            isCustom
              ? 'border-sky-500/50 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.03] to-transparent hover:border-sky-500/70'
              : 'border-border/60 bg-background/60 hover:border-sky-400/50',
            className,
          )}
          aria-label={labels.ariaLabel}
        >
          <span className="relative flex items-center">
            <TriggerIcon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isCustom
                  ? 'text-sky-500'
                  : 'text-muted-foreground group-hover:text-sky-500',
              )}
            />
          </span>
          <span
            className={cn(
              'max-w-[12rem] truncate text-xs font-medium tracking-wide transition-colors duration-200',
              isCustom
                ? 'text-foreground'
                : 'text-foreground/80 group-hover:text-foreground',
            )}
          >
            {triggerLabel}
          </span>
          <span
            className={cn(
              'ml-0.5 inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums transition-colors duration-200',
              isCustom
                ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
                : 'bg-muted/70 text-muted-foreground group-hover:bg-sky-500/15 group-hover:text-sky-600 dark:group-hover:text-sky-300',
            )}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : badge}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[20rem] rounded-xl p-1.5"
      >
        <DropdownMenuLabel className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          {labels.ariaLabel}
        </DropdownMenuLabel>
        {TIME_RANGE_PRESETS.map((preset) => {
          const active = value.kind === 'preset' && value.preset === preset;
          return (
            <DropdownMenuItem
              key={preset}
              onSelect={(e) => {
                e.preventDefault();
                handlePreset(preset);
              }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm',
                active && 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
              )}
            >
              <span className="flex items-center gap-2">
                <Clock
                  className={cn(
                    'h-3.5 w-3.5',
                    active ? 'text-sky-500' : 'text-muted-foreground',
                  )}
                />
                <span>{presetLabels[preset]}</span>
              </span>
              {active && <Check className="h-4 w-4 text-sky-500" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2 px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          <CalendarRange className="h-3.5 w-3.5" />
          <span>{labels.customRangeTitle}</span>
        </DropdownMenuLabel>

        <div
          className="space-y-2 px-2 pb-1"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <label className="block space-y-1">
            <span className="text-muted-foreground block text-xs">
              {labels.from}
            </span>
            <input
              type="datetime-local"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className={datetimeInputClass}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-muted-foreground block text-xs">
              {labels.until}
            </span>
            <input
              type="datetime-local"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className={datetimeInputClass}
            />
          </label>
          {validation.error && (
            <p className="text-destructive text-xs" role="alert">
              {validation.error}
            </p>
          )}
          {customExpanded && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={handleClear}
                disabled={!fromInput && !toInput}
              >
                {labels.clear}
              </Button>
              <Button
                size="sm"
                className="h-8 bg-sky-600 text-white hover:bg-sky-600/90"
                onClick={handleApply}
                disabled={!validation.ok}
              >
                {labels.apply}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
