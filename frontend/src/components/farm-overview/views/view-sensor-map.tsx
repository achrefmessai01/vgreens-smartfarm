'use client';

import * as React from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toast-provider';
import {
  formatParameterDisplayValue,
  getParameterColor,
  getParameterUnit,
} from '@/lib/farm-data';
import { useFullMapData } from '@/lib/hooks/use-full-map-data';
import { parseLiveSensorSlotId } from '@/lib/sensor-map-positions';
import { cn } from '@/lib/utils';
import type { ViewSensorMapProps } from '@/types/sensor-map';
import type { SensorWithPosition } from '@/types/view-single-bay.types';

interface LocalPositionOverride {
  leftPercent: number;
  topPercent: number;
}

interface ResolvedSensor extends SensorWithPosition {
  slotId: string;
  leftPercent: number;
  topPercent: number;
}

interface SensorDropResult {
  isValid: boolean;
  leftPercent: number;
  topPercent: number;
  xPosition: number;
  yPosition: number;
}

interface SensorPillProps {
  sensor: ResolvedSensor;
  parameter: string;
  unit: string;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  onSuppressibleClick: (slotId: string | null) => void;
  activeDragId: string | null;
  invalidPreviewId: string | null;
  invalidFlashId: string | null;
  savingDeviceId?: string | null;
  positionErrorDeviceId?: string | null;
  showTooltip: boolean;
  readOnly?: boolean;
}

function SensorPillContent({
  value,
  unit,
}: {
  value: number | null;
  unit: string;
}) {
  if (value == null) {
    return (
      <span className="text-[clamp(0.5625rem,0.1vw+0.52rem,0.625rem)]">--</span>
    );
  }

  return (
    <>
      <span className="text-[clamp(0.625rem,0.18vw+0.58rem,0.75rem)] leading-tight font-semibold tracking-tight">
        {formatParameterDisplayValue(value)}
      </span>
      <span className="-mt-0.5 text-[clamp(0.5rem,0.08vw+0.45rem,0.5625rem)] font-medium">
        {unit}
      </span>
    </>
  );
}

function SensorPill({
  sensor,
  parameter,
  unit,
  selectedSlotId,
  onSuppressibleClick,
  activeDragId,
  invalidPreviewId,
  invalidFlashId,
  savingDeviceId,
  positionErrorDeviceId,
  showTooltip,
  readOnly,
}: SensorPillProps) {
  const { slot, deviceId, value, leftPercent, topPercent, slotId } = sensor;
  const isSelected = slot ? selectedSlotId === slot.id : false;
  const isDraggingThis = activeDragId === slotId;
  const isInvalidPreview = invalidPreviewId === slotId;
  const isInvalidFlash = invalidFlashId === slotId;
  const isSaving = savingDeviceId === deviceId;
  const hasPersistError = positionErrorDeviceId === deviceId;
  const glowColor = slot
    ? getParameterColor(value ?? 0, parameter, slot.id)
    : 'rgb(200, 200, 200)';
  const tooltipContent =
    slot && value != null
      ? `${deviceId}: ${formatParameterDisplayValue(value)}${unit}`
      : deviceId;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: slotId,
      disabled: !slot || isSaving || !!readOnly,
    });

  const translate = transform ? CSS.Translate.toString(transform) : '';
  const pillBaseClasses = cn(
    'absolute flex select-none flex-col items-center justify-center rounded-full border tabular-nums backdrop-blur-sm will-change-transform',
    'h-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)] w-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)]',
    'transition-[transform,box-shadow,background-color,opacity] duration-200 ease-out',
    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
    slot
      ? 'border-white/30 bg-cyan-300/90 text-slate-900'
      : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50',
    slot && !isDraggingThis && !isSaving && !readOnly && 'cursor-grab hover:scale-105',
    isSelected && 'ring-2 ring-white/80 ring-offset-0',
    isDraggingThis && 'z-30 scale-110 cursor-grabbing',
    isSaving && 'ring-2 ring-cyan-500/60 animate-pulse',
    hasPersistError &&
      'ring-2 ring-destructive/70 bg-destructive/15 text-destructive',
    (isInvalidPreview || isInvalidFlash) &&
      'ring-2 ring-destructive/80 bg-destructive/15 text-destructive',
  );

  const baseStyle = {
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    transform: 'translate(-50%, -50%)',
  } as const;

  const pillBoxShadow =
    isInvalidPreview || isInvalidFlash || hasPersistError
      ? '0 0 0 1px rgba(220, 38, 38, 0.5), 0 0 22px rgba(220, 38, 38, 0.28)'
      : slot
        ? isDragging || isDraggingThis
          ? `0 18px 34px rgba(15, 23, 42, 0.28), 0 0 22px ${glowColor}`
          : `0 0 14px ${glowColor}, 0 0 24px ${glowColor}`
        : 'none';

  const button = (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() =>
        onSuppressibleClick(slot ? (isSelected ? null : slot.id) : null)
      }
      className={pillBaseClasses}
      style={{
        ...baseStyle,
        transform: translate
          ? `translate(-50%, -50%) ${translate}`
          : baseStyle.transform,
        transition:
          'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms ease, opacity 180ms ease',
        boxShadow: pillBoxShadow,
        touchAction: 'none',
      }}
      aria-busy={isSaving}
      disabled={!slot}
      {...attributes}
      {...listeners}
    >
      <SensorPillContent value={value} unit={unit} />
    </button>
  );

  return (
    <>
      {isDraggingThis && (
        <div
          aria-hidden="true"
          className={cn(
            pillBaseClasses,
            'pointer-events-none z-10 scale-95 opacity-25 shadow-none ring-0',
          )}
          style={baseStyle}
        >
          <SensorPillContent value={value} unit={unit} />
        </div>
      )}
      {showTooltip ? (
        <Tooltip content={tooltipContent}>{button}</Tooltip>
      ) : (
        button
      )}
    </>
  );
}

export function ViewSensorMap(props: ViewSensorMapProps) {
  const {
    parameter,
    selectedSlotId,
    onSelectSlot,
    className,
    greenhouseDimensions,
    onSensorPositionCommit,
    savingDeviceId,
    positionErrorDeviceId,
    invalidDropTitle = 'Invalid position',
    invalidDropDescription = 'Drop the sensor inside the greenhouse layout.',
    readOnly,
  } = props;
  const unit = getParameterUnit(parameter);
  const { toast } = useToast();
  const sensorsConfig = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const suppressClickRef = React.useRef(false);

  const { sensors } = useFullMapData(
    props.bay ? [props.bay] : [],
    parameter,
    props.showOnlyFilledPositions ?? false,
    greenhouseDimensions,
  );

  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [invalidPreviewId, setInvalidPreviewId] = React.useState<string | null>(
    null,
  );
  const [invalidFlashId, setInvalidFlashId] = React.useState<string | null>(
    null,
  );
  const [canvasInvalidFlash, setCanvasInvalidFlash] = React.useState(false);
  const [localPositionOverrides, setLocalPositionOverrides] = React.useState<
    Map<string, LocalPositionOverride>
  >(new Map());

  const resolvedSensors = React.useMemo<ResolvedSensor[]>(
    () =>
      sensors.map((sensor) => {
        const slotId = sensor.slot?.id ?? sensor.positionKey;
        const override = sensor.slot
          ? localPositionOverrides.get(sensor.slot.id)
          : undefined;
        return {
          ...sensor,
          slotId,
          leftPercent: override?.leftPercent ?? sensor.leftPercent,
          topPercent: override?.topPercent ?? sensor.topPercent,
        };
      }),
    [localPositionOverrides, sensors],
  );

  const resolvedSensorMap = React.useMemo(
    () => new Map(resolvedSensors.map((sensor) => [sensor.slotId, sensor])),
    [resolvedSensors],
  );

  React.useEffect(() => {
    setLocalPositionOverrides((current) => {
      if (current.size === 0) return current;

      let didChange = false;
      const next = new Map(current);

      for (const [slotId, override] of current.entries()) {
        const persistedSensor = sensors.find(
          (sensor) => sensor.slot?.id === slotId,
        );
        if (!persistedSensor) {
          next.delete(slotId);
          didChange = true;
          continue;
        }

        if (
          Math.abs(persistedSensor.leftPercent - override.leftPercent) < 0.01 &&
          Math.abs(persistedSensor.topPercent - override.topPercent) < 0.01
        ) {
          next.delete(slotId);
          didChange = true;
        }
      }

      return didChange ? next : current;
    });
  }, [sensors]);

  React.useEffect(() => {
    if (!invalidFlashId && !canvasInvalidFlash) return;

    const timeoutId = window.setTimeout(() => {
      setInvalidFlashId(null);
      setCanvasInvalidFlash(false);
    }, 850);

    return () => window.clearTimeout(timeoutId);
  }, [canvasInvalidFlash, invalidFlashId]);

  const getDropResult = React.useCallback(
    (
      sensor: ResolvedSensor | undefined,
      delta: { x: number; y: number },
    ): SensorDropResult | null => {
      const canvas = mapRef.current;
      if (!canvas || !sensor) return null;

      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const pixelX = (sensor.leftPercent / 100) * rect.width + delta.x;
      const pixelY = (sensor.topPercent / 100) * rect.height + delta.y;
      const isValid =
        pixelX >= 0 &&
        pixelX <= rect.width &&
        pixelY >= 0 &&
        pixelY <= rect.height;

      return {
        isValid,
        leftPercent: (pixelX / rect.width) * 100,
        topPercent: (pixelY / rect.height) * 100,
        xPosition: (pixelX / rect.width) * greenhouseDimensions!.xDimension,
        yPosition:
          (1 - pixelY / rect.height) * greenhouseDimensions!.yDimension,
      };
    },
    [greenhouseDimensions],
  );

  const releaseClickSuppression = React.useCallback(() => {
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, []);

  const handleSuppressibleClick = React.useCallback(
    (slotId: string | null) => {
      if (suppressClickRef.current) return;
      onSelectSlot(slotId);
    },
    [onSelectSlot],
  );

  const triggerInvalidFeedback = React.useCallback(() => {
    setCanvasInvalidFlash(true);
    toast({
      title: invalidDropTitle,
      description: invalidDropDescription,
      variant: 'destructive',
      duration: 2500,
    });
  }, [invalidDropDescription, invalidDropTitle, toast]);

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    suppressClickRef.current = true;
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      const slotId = String(event.active.id);
      const result = getDropResult(resolvedSensorMap.get(slotId), event.delta);
      setInvalidPreviewId(result?.isValid === false ? slotId : null);
    },
    [getDropResult, resolvedSensorMap],
  );

  const handleDragCancel = React.useCallback(() => {
    setActiveDragId(null);
    setInvalidPreviewId(null);
    releaseClickSuppression();
  }, [releaseClickSuppression]);

  const handleDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const slotId = String(event.active.id);
      const sensor = resolvedSensorMap.get(slotId);
      const result = getDropResult(sensor, event.delta);

      setActiveDragId(null);
      setInvalidPreviewId(null);
      releaseClickSuppression();

      if (!sensor?.slot || !result) return;
      const slot = sensor.slot;

      if (!result.isValid) {
        setInvalidFlashId(slotId);
        triggerInvalidFeedback();
        return;
      }

      setLocalPositionOverrides((current) => {
        const next = new Map(current);
        next.set(slot.id, {
          leftPercent: result.leftPercent,
          topPercent: result.topPercent,
        });
        return next;
      });

      const parsedSlot = parseLiveSensorSlotId(slot.id);

      try {
        await Promise.resolve(
          onSensorPositionCommit({
            slotId: slot.id,
            deviceId: parsedSlot.device || sensor.deviceId,
            greenhouse: parsedSlot.greenhouse,
            xPosition: result.xPosition,
            yPosition: result.yPosition,
          }),
        );
      } catch {
        setLocalPositionOverrides((current) => {
          const next = new Map(current);
          next.delete(slot.id);
          return next;
        });
      }
    },
    [
      getDropResult,
      onSensorPositionCommit,
      releaseClickSuppression,
      resolvedSensorMap,
      triggerInvalidFeedback,
    ],
  );

  if (!greenhouseDimensions) {
    return (
      <div
        className={cn(
          'border-border/40 bg-card flex h-full w-full flex-1 items-center justify-center rounded-xl border shadow-sm',
          className,
        )}
      >
        <p className="text-muted-foreground text-sm">
          Configure greenhouse dimensions to view layout
        </p>
      </div>
    );
  }

  const showTooltip = activeDragId == null;
  const showInvalidCanvasState =
    invalidPreviewId != null || canvasInvalidFlash || invalidFlashId != null;

  return (
    <div
      className={cn(
        'border-border/40 bg-card flex min-h-0 w-full flex-1 items-start justify-start overflow-hidden rounded-xl border shadow-sm transition-colors duration-200',
        showInvalidCanvasState && 'border-destructive/60 bg-destructive/5',
        className,
      )}
    >
      {resolvedSensors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sensor data</p>
      ) : (
        <DndContext
          sensors={sensorsConfig}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragCancel={handleDragCancel}
          onDragEnd={(event) => {
            void handleDragEnd(event);
          }}
        >
          <div ref={mapRef} className="relative h-full w-full overflow-hidden">
            {resolvedSensors.map((sensor) => (
              <SensorPill
                key={sensor.slotId}
                sensor={sensor}
                parameter={parameter}
                unit={unit}
                selectedSlotId={selectedSlotId}
                onSelectSlot={onSelectSlot}
                onSuppressibleClick={handleSuppressibleClick}
                activeDragId={activeDragId}
                invalidPreviewId={invalidPreviewId}
                invalidFlashId={invalidFlashId}
                savingDeviceId={savingDeviceId}
                positionErrorDeviceId={positionErrorDeviceId}
                showTooltip={showTooltip}
                readOnly={readOnly}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
