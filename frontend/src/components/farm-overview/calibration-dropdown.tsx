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
import type { SoilSensorConfig } from '@/lib/hooks/use-sensor-calibration';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, SlidersHorizontal } from 'lucide-react';

export interface CalibrationDropdownProps {
  configs: SoilSensorConfig[];
  tenantId?: string | null;
  onCalibrated?: () => void;
  triggerLabel?: string;
  emptyLabel?: string;
}

/**
 * Admin-only entry point to soil-sensor calibration: a dropdown of the tenant's
 * soil sensors; selecting one opens the calibration sidebar. Render this only
 * for admins — the server also enforces the role on the capture mutations.
 */
export function CalibrationDropdown({
  configs,
  tenantId,
  onCalibrated,
  triggerLabel = 'Calibrate sensors',
  emptyLabel = 'No soil sensors',
}: CalibrationDropdownProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const selected = React.useMemo(
    () => configs.find((c) => c.id === selectedId) ?? null,
    [configs, selectedId],
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
        <DropdownMenuContent align="end" className="w-64 p-1.5">
          <DropdownMenuLabel className="px-2 pt-1 pb-1.5 text-xs font-semibold tracking-wide uppercase">
            {triggerLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {configs.length === 0 ? (
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              {emptyLabel}
            </div>
          ) : (
            configs.map((c) => {
              const Icon = c.isCalibrated ? CheckCircle2 : Circle;
              return (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => handleSelect(c.id)}
                  className="rounded-md py-2"
                >
                  <span className="flex w-full items-center gap-2">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        c.isCalibrated
                          ? 'text-emerald-500'
                          : 'text-muted-foreground',
                      )}
                    />
                    <span className="text-sm font-medium">{c.device}</span>
                    <span className="text-muted-foreground ml-auto text-[10px] uppercase">
                      {c.isCalibrated ? 'Calibrated' : 'Not set'}
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
        sensor={selected}
        tenantId={tenantId}
        onCalibrated={onCalibrated}
      />
    </>
  );
}
