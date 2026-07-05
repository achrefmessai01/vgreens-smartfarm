'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type {
  IrrigationCycle,
  IrrigationCycleSensor,
} from '@/lib/hooks/use-irrigation-cycles';
import {
  useCycleCalibration,
  type CalibrationPhase,
  type SensorCaptureState,
} from '@/lib/hooks/use-cycle-calibration';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplet,
  Sprout,
  Sun,
  TriangleAlert,
  Waves,
  X,
} from 'lucide-react';

export interface CalibrationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: IrrigationCycle | null;
  tenantId?: string | null;
  /** Refetch cycles/configs so the persisted bounds re-render. */
  onCalibrated?: () => void;
}

function formatReading(value?: number | null): string {
  return value == null ? '—' : value.toFixed(2);
}

/** Elapsed milliseconds as m:ss. */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const PHASE_META: Record<
  CalibrationPhase,
  {
    title: string;
    boundLabel: string;
    explanation: string;
    instruction: string;
  }
> = {
  dry: {
    title: 'Dry calibration',
    boundLabel: 'avgDryReading',
    explanation:
      'Anchors each sensor’s 0% moisture reference. With the cycle’s soil dry, every sensor’s next real reading is stored as its dry bound.',
    instruction:
      'Make sure the soil around the cycle’s sensors is dry (or lift them into dry soil), then start the capture.',
  },
  saturated: {
    title: 'Saturated calibration',
    boundLabel: 'avgSaturatedReading',
    explanation:
      'Anchors each sensor’s 100% moisture reference. Right after irrigating the cycle to saturation, every sensor’s next real reading is stored as its saturated bound.',
    instruction:
      'Run the cycle’s irrigation until the soil is saturated, then start the capture.',
  },
};

function phaseValue(
  sensor: IrrigationCycleSensor,
  phase: CalibrationPhase,
): number | null {
  return phase === 'dry' ? sensor.avgDryReading : sensor.avgSaturatedReading;
}

type RowBadge = 'calibrating' | 'calibrated' | 'none';

function rowBadgeFor(
  sensor: IrrigationCycleSensor,
  phase: CalibrationPhase,
  capture: SensorCaptureState | undefined,
): RowBadge {
  const busyThisPhase =
    capture !== undefined &&
    capture.phase === phase &&
    (capture.status === 'waiting' || capture.status === 'saving');
  if (busyThisPhase) return 'calibrating';
  return phaseValue(sensor, phase) != null ? 'calibrated' : 'none';
}

/**
 * Cycle-based soil calibration: an overview with one card per phase (dry /
 * saturated); opening a phase lists every soil sensor in the cycle with its
 * current bound and per-phase status, calibratable one-by-one or all at once.
 * Each capture has its own independent lifecycle (sensors transmit on their
 * own ~10 min schedules), so a bulk run finishes sensor by sensor.
 */
export function CalibrationSidebar({
  open,
  onOpenChange,
  cycle,
  tenantId,
  onCalibrated,
}: CalibrationSidebarProps) {
  const [view, setView] = React.useState<'overview' | CalibrationPhase>(
    'overview',
  );
  const {
    captures,
    clearing,
    anyBusy,
    now,
    start,
    startAll,
    cancel,
    cancelAll,
    clearBound,
    clearAll,
  } = useCycleCalibration({ tenantId, onCalibrated });

  // Abandon all in-flight captures when the sheet closes (explicit close is a
  // cancel — status is client-side only)…
  React.useEffect(() => {
    if (!open) {
      cancelAll();
      setView('overview');
    }
  }, [open, cancelAll]);
  // …and when the selected cycle changes, so captures started for one cycle
  // never render against another.
  React.useEffect(() => {
    cancelAll();
    setView('overview');
  }, [cycle?.id, cancelAll]);

  const sensors = React.useMemo(() => cycle?.sensors ?? [], [cycle?.sensors]);

  const countWithBound = (phase: CalibrationPhase) =>
    sensors.filter((s) => phaseValue(s, phase) != null).length;

  const degenerateCount = sensors.filter(
    (s) =>
      s.avgDryReading != null &&
      s.avgSaturatedReading != null &&
      s.avgDryReading === s.avgSaturatedReading,
  ).length;

  const fullyCalibrated =
    sensors.length > 0 && sensors.every((s) => s.isCalibrated);

  const renderPhaseCard = (phase: CalibrationPhase) => {
    const meta = PHASE_META[phase];
    const withBound = countWithBound(phase);
    const Icon = phase === 'dry' ? Sun : Waves;
    return (
      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Icon className="text-primary h-4 w-4" />
          <h3 className="text-sm font-medium">{meta.title}</h3>
        </div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          {meta.explanation}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs tabular-nums">
            {withBound} of {sensors.length} sensor
            {sensors.length === 1 ? '' : 's'} set
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView(phase)}
            disabled={sensors.length === 0}
          >
            {meta.title}
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const renderSensorRow = (
    sensor: IrrigationCycleSensor,
    phase: CalibrationPhase,
  ) => {
    const capture = captures[sensor.id];
    const busy =
      capture !== undefined &&
      (capture.status === 'waiting' || capture.status === 'saving');
    const busyThisPhase = busy && capture.phase === phase;
    const busyOtherPhase = busy && capture.phase !== phase;
    const isClearing = clearing[sensor.id] === true;
    const errored =
      capture !== undefined &&
      capture.status === 'error' &&
      capture.phase === phase;
    const value = phaseValue(sensor, phase);
    const badge = rowBadgeFor(sensor, phase, capture);

    return (
      <div key={sensor.id} className="bg-card rounded-xl border p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{sensor.device}</p>
            <p className="text-muted-foreground text-xs">
              <span>{PHASE_META[phase].boundLabel}</span>
              <span className="ml-2 font-semibold tabular-nums">
                {formatReading(value)}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] uppercase',
                badge === 'calibrating' &&
                  'animate-pulse border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
                badge === 'calibrated' &&
                  'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                badge === 'none' && 'text-muted-foreground',
              )}
            >
              {badge === 'calibrating'
                ? 'Calibrating'
                : badge === 'calibrated'
                  ? 'Calibrated'
                  : 'Not calibrated'}
            </Badge>
            {busyThisPhase ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => cancel(sensor.id)}
              >
                Cancel
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={busyOtherPhase || isClearing}
                  onClick={() => start(sensor.id, phase)}
                >
                  <Droplet
                    className={cn(
                      'mr-1 h-3 w-3',
                      phase === 'saturated' && 'fill-current',
                    )}
                  />
                  {value != null || errored ? 'Recalibrate' : 'Calibrate'}
                </Button>
                {value != null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs"
                    disabled={busyOtherPhase || isClearing}
                    onClick={() => void clearBound(sensor.id, phase)}
                    aria-label={`Clear ${PHASE_META[phase].boundLabel} of ${sensor.device}`}
                  >
                    {isClearing ? 'Clearing…' : 'Clear'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {busyThisPhase && (
          <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-xs">
            <span>
              {capture.status === 'saving'
                ? 'Saving calibration…'
                : 'Waiting for the next transmission (~10 min). Keep the sensor in place.'}
            </span>
            <span
              className="flex shrink-0 items-center gap-1 tabular-nums"
              aria-live="polite"
              title="Time since you pressed calibrate"
            >
              <Clock className="h-3 w-3" />
              {formatElapsed(now - capture.startedAt)}
            </span>
          </div>
        )}
        {busyOtherPhase && (
          <p className="text-muted-foreground mt-2 text-xs">
            Busy with {PHASE_META[capture.phase].title.toLowerCase()} — wait or
            cancel it first.
          </p>
        )}
        {errored && (
          <div className="mt-2 flex items-start justify-between gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            <span>{capture.error}</span>
            <button
              type="button"
              className="shrink-0 opacity-70 hover:opacity-100"
              onClick={() => cancel(sensor.id)}
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPhaseView = (phase: CalibrationPhase) => {
    const meta = PHASE_META[phase];
    const idleSensorIds = sensors
      .filter((s) => {
        const capture = captures[s.id];
        return (
          capture === undefined ||
          (capture.status !== 'waiting' && capture.status !== 'saving')
        );
      })
      .map((s) => s.id);
    const runningCount = sensors.length - idleSensorIds.length;
    // Sensors whose bound for this phase can be cleared right now.
    const clearableSensorIds = sensors
      .filter(
        (s) =>
          phaseValue(s, phase) != null &&
          idleSensorIds.includes(s.id) &&
          clearing[s.id] !== true,
      )
      .map((s) => s.id);

    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 w-fit px-2 text-xs"
          onClick={() => setView('overview')}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Back to overview
        </Button>

        <div className="bg-card rounded-xl border p-3 shadow-sm">
          <p className="text-muted-foreground text-xs">{meta.instruction}</p>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={idleSensorIds.length === 0}
                onClick={() => startAll(idleSensorIds, phase)}
              >
                <Droplet
                  className={cn(
                    'mr-1.5 h-3.5 w-3.5',
                    phase === 'saturated' && 'fill-current',
                  )}
                />
                Calibrate all sensors
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-muted-foreground hover:text-destructive"
                disabled={clearableSensorIds.length === 0}
                onClick={() => clearAll(clearableSensorIds, phase)}
              >
                Clear all
              </Button>
            </div>
            {runningCount > 0 && (
              <span className="text-muted-foreground text-xs tabular-nums">
                {runningCount} running
              </span>
            )}
          </div>
        </div>

        {sensors.map((sensor) => renderSensorRow(sensor, phase))}
      </>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 flex w-full max-w-full flex-col gap-0 p-0 backdrop-blur-sm sm:max-w-lg"
        // While any capture runs, an outside click must not close the sidebar
        // (abandoning N in-flight captures by mis-click would be costly). The
        // X button still closes — an explicit close cancels everything.
        onInteractOutside={(event) => {
          if (anyBusy) event.preventDefault();
        }}
      >
        <SheetHeader className="from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 dark:border-primary-foreground/30 border-b bg-gradient-to-r px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div className="mb-2 flex items-center gap-2">
            <Sprout className="text-primary h-4 w-4" />
            <Badge variant="secondary" className="text-[10px] uppercase">
              Irrigation cycle
            </Badge>
          </div>
          <SheetTitle>{cycle?.name ?? 'Irrigation cycle'}</SheetTitle>
          <SheetDescription>
            Two-point calibration maps each sensor&apos;s dry reading to 0% and
            its saturated reading to 100% moisture. Calibrate every soil sensor
            in this cycle — individually or all at once.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6">
          {!cycle ? (
            <p className="text-muted-foreground text-sm">No cycle selected.</p>
          ) : sensors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No soil sensors are assigned to this cycle yet. Assign them in the
              Farm Overview Configuration.
            </p>
          ) : view === 'overview' ? (
            <>
              {fullyCalibrated && degenerateCount === 0 && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  Every sensor in this cycle is calibrated. Re-running a phase
                  overwrites that bound.
                </div>
              )}
              {degenerateCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {degenerateCount} sensor{degenerateCount === 1 ? '' : 's'}{' '}
                    have equal dry and saturated readings — moisture can&apos;t
                    be computed (divide by zero). Recapture one of the bounds.
                  </span>
                </div>
              )}
              {renderPhaseCard('dry')}
              {renderPhaseCard('saturated')}
            </>
          ) : (
            renderPhaseView(view)
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
