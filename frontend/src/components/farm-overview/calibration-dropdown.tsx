'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalibrationSidebar } from './calibration-sidebar';
import type { IrrigationCycle } from '@/lib/hooks/use-irrigation-cycles';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, SlidersHorizontal } from 'lucide-react';

export interface CalibrationDropdownProps {
  cycles: IrrigationCycle[];
  tenantId?: string | null;
  onCalibrated?: () => void;
  triggerLabel?: string;
  emptyLabel?: string;
}

/**
 * Admin-only entry point to soil-sensor calibration: a dropdown of the
 * tenant's IRRIGATION CYCLES (the grouping unit — was: individual sensors);
 * selecting one opens the calibration sidebar for every soil sensor in the
 * cycle. Render this only for admins — the server also enforces the role on
 * the cycles query and the capture mutations.
 */
export function CalibrationDropdown({
  cycles,
  tenantId,
  onCalibrated,
  triggerLabel = 'Calibrate sensors',
  emptyLabel = 'No irrigation cycles',
}: CalibrationDropdownProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Derived from the live list so refetches after each capture flow straight
  // into the open sidebar.
  const selected = React.useMemo(
    () => cycles.find((c) => c.id === selectedId) ?? null,
    [cycles, selectedId],
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSidebarOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-full"
            aria-label={triggerLabel}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs font-medium">{triggerLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-1.5">
          <DropdownMenuLabel className="px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
            {triggerLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {cycles.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              {emptyLabel}
            </div>
          ) : (
            cycles.map((cycle) => {
              const total = cycle.sensors.length;
              const calibrated = cycle.sensors.filter(
                (s) => s.isCalibrated,
              ).length;
              const allCalibrated = total > 0 && calibrated === total;
              const Icon = allCalibrated ? CheckCircle2 : Circle;
              return (
                <DropdownMenuItem
                  key={cycle.id}
                  onSelect={() => handleSelect(cycle.id)}
                  className="rounded-md py-2"
                >
                  <span className="flex w-full items-center gap-2">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        allCalibrated
                          ? 'text-emerald-500'
                          : 'text-muted-foreground',
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {cycle.name}
                      </span>
                      {cycle.greenhouse && (
                        <span className="text-muted-foreground block truncate text-[10px]">
                          {cycle.greenhouse}
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground ml-auto shrink-0 text-[10px] uppercase tabular-nums">
                      {total === 0
                        ? 'No sensors'
                        : `${calibrated}/${total} calibrated`}
                    </span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CalibrationSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        cycle={selected}
        tenantId={tenantId}
        onCalibrated={onCalibrated}
      />
    </>
  );
}
