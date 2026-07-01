'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useSensorCalibrationCapture,
  type CaptureBound,
  type SoilSensorConfig,
} from '@/lib/hooks/use-sensor-calibration';
import { isSoilCalibrated } from '@/lib/soil-calibration';
import { Droplet, Sprout, TriangleAlert } from 'lucide-react';

export interface CalibrationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensor: SoilSensorConfig | null;
  tenantId?: string | null;
  /** Refetch the soil configs so the persisted averages re-render. */
  onCalibrated?: () => void;
}

function formatReading(value?: number | null): string {
  return value == null ? '—' : value.toFixed(2);
}

export function CalibrationSidebar({
  open,
  onOpenChange,
  sensor,
  tenantId,
  onCalibrated,
}: CalibrationSidebarProps) {
  const { status, bound, error, busy, startDry, startSaturated, cancel } =
    useSensorCalibrationCapture({
      sensorConfigId: sensor?.id ?? null,
      tenantId,
      onCalibrated,
    });

  // Cancel any in-flight capture when the sensor changes or the sheet closes,
  // so a wait started for one sensor never resolves against another.
  React.useEffect(() => {
    if (!open) cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sensor?.id]);

  const degenerate =
    sensor?.avgDryReading != null &&
    sensor?.avgSaturatedReading != null &&
    sensor.avgDryReading === sensor.avgSaturatedReading;

  const calibrated = isSoilCalibrated(
    sensor?.avgDryReading,
    sensor?.avgSaturatedReading,
  );

  const renderCapture = (target: CaptureBound) => {
    const isThis = busy && bound === target;
    if (!isThis) return null;
    return (
      <div className="mt-2 space-y-1.5">
        <Progress
          value={100}
          className="animate-pulse [&>[data-slot=progress-indicator]]:bg-sky-500"
        />
        <p className="text-muted-foreground text-xs">
          {status === 'saving'
            ? 'Saving calibration…'
            : 'Waiting for the next sensor transmission (~10 min). Keep the sensor in place.'}
        </p>
        <Button variant="ghost" size="sm" onClick={cancel} className="h-7 px-2 text-xs">
          Cancel
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 flex w-full max-w-full flex-col gap-0 p-0 backdrop-blur-sm sm:max-w-lg"
      >
        <SheetHeader className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary-foreground/30 border-b bg-gradient-to-r px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="mb-2 flex items-center gap-2">
            <Sprout className="text-primary h-4 w-4" />
            <Badge variant="secondary" className="text-[10px] uppercase">
              Soil calibration
            </Badge>
          </div>
          <SheetTitle>{sensor?.device ?? 'Sensor'}</SheetTitle>
          <SheetDescription>
            Two-point calibration maps the dry reading to 0% and the saturated
            reading to 100% moisture. Readings are captured live from the sensor.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          {!sensor ? (
            <p className="text-muted-foreground text-sm">No sensor selected.</p>
          ) : (
            <>
              {calibrated && !degenerate && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  This sensor is calibrated. Re-running a step overwrites that
                  bound.
                </div>
              )}
              {degenerate && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Dry and saturated readings are equal — moisture can’t be
                    computed (divide by zero). Recapture one of the bounds.
                  </span>
                </div>
              )}

              {/* Step 1 — dry */}
              <div className="bg-card rounded-xl border p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                    1
                  </span>
                  <h3 className="text-sm font-medium">Dry calibration</h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Remove the sensor from the soil and place it in dry soil. When
                  it has settled, press the button — the next real reading is
                  captured as the dry bound.
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={startDry}
                  >
                    <Droplet className="mr-1.5 h-3.5 w-3.5" />
                    Dry calibration
                  </Button>
                  <span className="text-right text-xs">
                    <span className="text-muted-foreground">avgDryReading</span>
                    <span className="ml-2 font-semibold tabular-nums">
                      {formatReading(sensor.avgDryReading)}
                    </span>
                  </span>
                </div>
                {renderCapture('dry')}
              </div>

              {/* Step 2 — saturated */}
              <div className="bg-card rounded-xl border p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                    2
                  </span>
                  <h3 className="text-sm font-medium">Saturated calibration</h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Return the sensor to real soil and run an irrigation so the
                  soil is saturated. When it has settled, press the button — the
                  next real reading is captured as the saturated bound.
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={startSaturated}
                  >
                    <Droplet className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Saturated calibration
                  </Button>
                  <span className="text-right text-xs">
                    <span className="text-muted-foreground">
                      avgSaturatedReading
                    </span>
                    <span className="ml-2 font-semibold tabular-nums">
                      {formatReading(sensor.avgSaturatedReading)}
                    </span>
                  </span>
                </div>
                {renderCapture('saturated')}
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
