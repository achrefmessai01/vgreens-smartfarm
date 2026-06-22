'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFieldToLabel } from '@/lib/farm-data';
import { SENSOR_TYPE_TOGGLES } from '@/lib/farm-overview-constants';
import { getParameterIcon } from '@/lib/parameter-status';
import { cn } from '@/lib/utils';

export interface SensorVisibilityDropdownProps {
  /** Set of disabled InfluxDB `_field` values for the active tenant. */
  disabledFields: Set<string>;
  /**
   * Called when the user toggles a sensor type. `fields` is the list of
   * Influx field names that share this toggle (usually one; PAR / Soil EC
   * group two). `enabled === true` means the toggle was *checked*.
   */
  onToggle: (fields: string[], enabled: boolean) => Promise<void> | void;
  saving?: boolean;
  triggerLabel: string;
  emptyLabel?: string;
  showAllLabel?: string;
  hideAllLabel?: string;
  visibleSuffixLabel?: string;
}

/**
 * Per-parameter accent colors. Match the spirit of the heatmap / sensor
 * tile palette so the dropdown ties visually to the rest of the farm
 * overview UI.
 */
const PARAMETER_ACCENT: Record<string, string> = {
  temperature: 'text-orange-400',
  humidity: 'text-sky-400',
  co2: 'text-emerald-400',
  soil_ec: 'text-amber-400',
  soil_moisture: 'text-lime-400',
  vpd: 'text-violet-400',
  par: 'text-yellow-400',
};

function accentClass(key: string): string {
  return PARAMETER_ACCENT[key] ?? 'text-muted-foreground';
}

export function SensorVisibilityDropdown({
  disabledFields,
  onToggle,
  saving = false,
  triggerLabel,
  emptyLabel,
  showAllLabel = 'Show all',
  hideAllLabel = 'Hide all',
  visibleSuffixLabel = 'visible',
}: SensorVisibilityDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const hiddenCount = SENSOR_TYPE_TOGGLES.filter((group) =>
    group.fields.every((f) => disabledFields.has(f)),
  ).length;
  const totalCount = SENSOR_TYPE_TOGGLES.length;
  const allDisabled = hiddenCount === totalCount;
  const someDisabled = hiddenCount > 0;
  const TriggerIcon = allDisabled ? EyeOff : Eye;

  const handleToggleAll = React.useCallback(
    (enable: boolean) => {
      const allFields = SENSOR_TYPE_TOGGLES.flatMap((g) => g.fields);
      void onToggle(allFields, enable);
    },
    [onToggle],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'group relative h-9 gap-2 overflow-hidden rounded-full border px-1 pr-1 pl-3 shadow-sm backdrop-blur-sm transition-all duration-200',
            'hover:-translate-y-px hover:shadow-md',
            'data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-emerald-400/30',
            someDisabled
              ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.03] to-transparent hover:border-amber-500/70'
              : 'border-border/60 bg-background/60 hover:border-emerald-400/50',
          )}
          disabled={saving}
          aria-label={triggerLabel}
        >
          <span className="relative flex items-center">
            <TriggerIcon
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                someDisabled
                  ? 'text-amber-500'
                  : 'text-muted-foreground group-hover:text-emerald-500',
              )}
            />
            {someDisabled && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
            )}
          </span>
          <span
            className={cn(
              'text-xs font-medium tracking-wide transition-colors duration-200',
              someDisabled
                ? 'text-foreground'
                : 'text-foreground/80 group-hover:text-foreground',
            )}
          >
            {triggerLabel}
          </span>
          <span
            className={cn(
              'ml-0.5 inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums transition-colors duration-200',
              someDisabled
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                : 'bg-muted/70 text-muted-foreground group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-300',
            )}
          >
            {totalCount - hiddenCount}
            <span className="text-foreground/30 mx-0.5">/</span>
            {totalCount}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuLabel className="flex items-center justify-between px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
          <span>{triggerLabel}</span>
          <span className="text-muted-foreground text-[10px] normal-case tabular-nums">
            {totalCount - hiddenCount} / {totalCount} {visibleSuffixLabel}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SENSOR_TYPE_TOGGLES.length === 0 ? (
          <div className="text-muted-foreground px-2 py-1.5 text-xs">
            {emptyLabel ?? '—'}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 py-1">
            {SENSOR_TYPE_TOGGLES.map((group) => {
              const isEnabled = group.fields.some(
                (f) => !disabledFields.has(f),
              );
              const Icon = getParameterIcon(group.key);
              const label = formatFieldToLabel(group.key);
              return (
                <DropdownMenuCheckboxItem
                  key={group.key}
                  checked={isEnabled}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(checked) => {
                    void onToggle(group.fields, checked === true);
                  }}
                  className={cn(
                    'rounded-md py-2 transition-opacity',
                    !isEnabled && 'opacity-55',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 transition-colors',
                        isEnabled
                          ? accentClass(group.key)
                          : 'text-muted-foreground',
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        !isEnabled && 'line-through decoration-[1.5px]',
                      )}
                    >
                      {label}
                    </span>
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="flex items-center gap-1 px-1 pt-1 pb-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 flex-1 text-[11px] font-medium"
            onClick={() => handleToggleAll(true)}
            disabled={saving || hiddenCount === 0}
          >
            {showAllLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-7 flex-1 text-[11px] font-medium"
            onClick={() => handleToggleAll(false)}
            disabled={saving || allDisabled}
          >
            {hideAllLabel}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
