'use client';

import * as React from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import {
  getXYFromPosition,
  type GreenhouseDimensions,
  parseLiveSensorSlotId,
} from '@/lib/sensor-map-positions';
import { cn } from '@/lib/utils';
import type { PlantSlot } from '@/types/farm.types';
import type { SensorPositionCommit } from '@/types/sensor-map';

// =============================================================================
// Position helpers (shared by the discrete map and the all-sensors map)
// =============================================================================

export function roundPosition(value: number) {
  return Number(value.toFixed(2));
}

export function formatPositionValue(value: number) {
  return `${value.toFixed(2)} m`;
}

export function formatPositionInputValue(value: number) {
  return `${roundPosition(value)}`;
}

export function parsePositionInputValue(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export function getPositionFromPercents(
  leftPercent: number,
  topPercent: number,
  greenhouseDimensions: GreenhouseDimensions,
) {
  const { xPosition, yPosition } = getXYFromPosition(
    leftPercent,
    topPercent,
    greenhouseDimensions,
  );
  return {
    xPosition: roundPosition(xPosition),
    yPosition: roundPosition(yPosition),
  };
}

// =============================================================================
// Position-edit tooltip (device id + editable x/y form, read-only aware)
// =============================================================================

interface SensorPositionTooltipContentProps {
  deviceId: string;
  currentXPosition: number;
  currentYPosition: number;
  greenhouseDimensions: GreenhouseDimensions;
  readOnly?: boolean;
  saving?: boolean;
  onSave?: (xPosition: number, yPosition: number) => Promise<void>;
  /** Hide the device-name header (when the caller renders its own header). */
  hideDeviceHeader?: boolean;
}

export function SensorPositionTooltipContent({
  deviceId,
  currentXPosition,
  currentYPosition,
  greenhouseDimensions,
  readOnly,
  saving,
  onSave,
  hideDeviceHeader,
}: SensorPositionTooltipContentProps) {
  const { t } = useI18n();
  const sensorConfigT = t.pages.admin.tenants.sensorConfig;
  const [xValue, setXValue] = React.useState(
    formatPositionInputValue(currentXPosition),
  );
  const [yValue, setYValue] = React.useState(
    formatPositionInputValue(currentYPosition),
  );

  React.useEffect(() => {
    setXValue(formatPositionInputValue(currentXPosition));
    setYValue(formatPositionInputValue(currentYPosition));
  }, [currentXPosition, currentYPosition]);

  const parsedXValue = parsePositionInputValue(xValue);
  const parsedYValue = parsePositionInputValue(yValue);
  const hasValidNumbers =
    Number.isFinite(parsedXValue) && Number.isFinite(parsedYValue);
  const nextRoundedX = hasValidNumbers ? roundPosition(parsedXValue) : null;
  const nextRoundedY = hasValidNumbers ? roundPosition(parsedYValue) : null;
  const isWithinBounds =
    nextRoundedX != null &&
    nextRoundedY != null &&
    nextRoundedX >= 0 &&
    nextRoundedX <= greenhouseDimensions.xDimension &&
    nextRoundedY >= 0 &&
    nextRoundedY <= greenhouseDimensions.yDimension;
  const isDirty =
    nextRoundedX !== roundPosition(currentXPosition) ||
    nextRoundedY !== roundPosition(currentYPosition);
  const disableSave =
    readOnly || saving || !hasValidNumbers || !isWithinBounds || !isDirty;

  const handleReset = React.useCallback(() => {
    setXValue(formatPositionInputValue(currentXPosition));
    setYValue(formatPositionInputValue(currentYPosition));
  }, [currentXPosition, currentYPosition]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (
        !onSave ||
        disableSave ||
        nextRoundedX == null ||
        nextRoundedY == null
      ) {
        return;
      }
      void onSave(nextRoundedX, nextRoundedY);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !onSave ||
      disableSave ||
      nextRoundedX == null ||
      nextRoundedY == null
    ) {
      return;
    }

    await onSave(nextRoundedX, nextRoundedY);
  }

  const xInvalid =
    xValue !== '' &&
    (!Number.isFinite(parsedXValue) ||
      parsedXValue < 0 ||
      parsedXValue > greenhouseDimensions.xDimension);
  const yInvalid =
    yValue !== '' &&
    (!Number.isFinite(parsedYValue) ||
      parsedYValue < 0 ||
      parsedYValue > greenhouseDimensions.yDimension);

  return (
    <div className="w-56 space-y-2.5">
      {!hideDeviceHeader && (
        <div className="space-y-1">
          <div className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
            {sensorConfigT.device}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold">{deviceId}</span>
            {saving ? (
              <span className="text-muted-foreground text-[10px] font-medium">
                {sensorConfigT.saving}
              </span>
            ) : null}
          </div>
        </div>
      )}

      {readOnly ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              {sensorConfigT.xPosition}
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatPositionValue(currentXPosition)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              {sensorConfigT.yPosition}
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatPositionValue(currentYPosition)}
            </div>
          </div>
        </div>
      ) : (
        <form
          className="space-y-2.5"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                {sensorConfigT.xPosition}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={greenhouseDimensions.xDimension}
                value={xValue}
                onChange={(event) => setXValue(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-invalid={xInvalid}
                className="h-8 px-2 text-xs tabular-nums"
              />
              <div className="text-muted-foreground text-[10px] tabular-nums">
                0.00 - {formatPositionValue(greenhouseDimensions.xDimension)}
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                {sensorConfigT.yPosition}
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={greenhouseDimensions.yDimension}
                value={yValue}
                onChange={(event) => setYValue(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-invalid={yInvalid}
                className="h-8 px-2 text-xs tabular-nums"
              />
              <div className="text-muted-foreground text-[10px] tabular-nums">
                0.00 - {formatPositionValue(greenhouseDimensions.yDimension)}
              </div>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving || !isDirty}
              onClick={handleReset}
              className="h-7 px-2 text-xs"
            >
              {sensorConfigT.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={disableSave}
              className="h-7 px-2 text-xs"
            >
              {saving ? sensorConfigT.saving : sensorConfigT.save}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// =============================================================================
// Bay divider lines (visual columns/rows for multi-bay greenhouses)
// =============================================================================

export function BayDividerLines({
  greenhouseDimensions,
}: {
  greenhouseDimensions: GreenhouseDimensions;
}) {
  if (
    greenhouseDimensions.bayCount == null ||
    greenhouseDimensions.bayCount <= 1
  ) {
    return null;
  }
  return (
    <>
      {Array.from({ length: greenhouseDimensions.bayCount - 1 }, (_, i) => {
        const offset = `${((i + 1) / greenhouseDimensions.bayCount!) * 100}%`;
        return (
          <div
            key={`bay-line-${i}`}
            aria-hidden="true"
            className={cn(
              'bg-foreground/15 pointer-events-none absolute',
              greenhouseDimensions.isHorizontal
                ? 'inset-x-0 h-px'
                : 'inset-y-0 w-px',
            )}
            style={
              greenhouseDimensions.isHorizontal
                ? { top: offset }
                : { left: offset }
            }
          />
        );
      })}
    </>
  );
}

// =============================================================================
// useSensorMapDrag — drag/bounds/commit machinery shared by both map views
// =============================================================================

/** Minimal shape a map item must expose for the drag hook. */
export interface DraggableSensorItem {
  slotId: string;
  slot: PlantSlot | null;
  deviceId: string;
  leftPercent: number;
  topPercent: number;
}

interface LocalPositionOverride {
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

interface UseSensorMapDragArgs<T extends DraggableSensorItem> {
  items: T[];
  greenhouseDimensions?: GreenhouseDimensions | null;
  onSensorPositionCommit: (
    payload: SensorPositionCommit,
  ) => Promise<void> | void;
  onSelectSlot: (slotId: string | null) => void;
  invalidDropTitle: string;
  invalidDropDescription: string;
}

interface UseSensorMapDragResult<T extends DraggableSensorItem> {
  mapRef: React.RefObject<HTMLDivElement | null>;
  sensorsConfig: ReturnType<typeof useSensors>;
  resolvedItems: T[];
  resolvedItemMap: Map<string, T>;
  dndHandlers: {
    onDragStart: (event: DragStartEvent) => void;
    onDragMove: (event: DragMoveEvent) => void;
    onDragCancel: () => void;
    onDragEnd: (event: DragEndEvent) => void;
  };
  activeDragId: string | null;
  invalidPreviewId: string | null;
  invalidFlashId: string | null;
  showTooltip: boolean;
  showInvalidCanvasState: boolean;
  handleSuppressibleClick: (slotId: string | null) => void;
}

/**
 * Owns the @dnd-kit drag state, optimistic position overrides, bounds
 * validation, and invalid-drop feedback for a draggable greenhouse map.
 * Measurement-agnostic: it operates purely on item positions + slot ids, so it
 * backs both the single-parameter discrete map and the all-sensors map.
 */
export function useSensorMapDrag<T extends DraggableSensorItem>({
  items,
  greenhouseDimensions,
  onSensorPositionCommit,
  onSelectSlot,
  invalidDropTitle,
  invalidDropDescription,
}: UseSensorMapDragArgs<T>): UseSensorMapDragResult<T> {
  const { toast } = useToast();
  const sensorsConfig = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const suppressClickRef = React.useRef(false);

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

  const resolvedItems = React.useMemo<T[]>(
    () =>
      items.map((item) => {
        const override = item.slot
          ? localPositionOverrides.get(item.slot.id)
          : undefined;
        return {
          ...item,
          leftPercent: override?.leftPercent ?? item.leftPercent,
          topPercent: override?.topPercent ?? item.topPercent,
        };
      }),
    [localPositionOverrides, items],
  );

  const resolvedItemMap = React.useMemo(
    () => new Map(resolvedItems.map((item) => [item.slotId, item])),
    [resolvedItems],
  );

  // Drop optimistic overrides once the persisted positions catch up to them.
  React.useEffect(() => {
    setLocalPositionOverrides((current) => {
      if (current.size === 0) return current;

      let didChange = false;
      const next = new Map(current);

      for (const [slotId, override] of current.entries()) {
        const persisted = items.find((item) => item.slot?.id === slotId);
        if (!persisted) {
          next.delete(slotId);
          didChange = true;
          continue;
        }

        if (
          Math.abs(persisted.leftPercent - override.leftPercent) < 0.01 &&
          Math.abs(persisted.topPercent - override.topPercent) < 0.01
        ) {
          next.delete(slotId);
          didChange = true;
        }
      }

      return didChange ? next : current;
    });
  }, [items]);

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
      item: T | undefined,
      delta: { x: number; y: number },
    ): SensorDropResult | null => {
      const canvas = mapRef.current;
      if (!canvas || !item || !greenhouseDimensions) return null;

      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const pixelX = (item.leftPercent / 100) * rect.width + delta.x;
      const pixelY = (item.topPercent / 100) * rect.height + delta.y;
      const isValid =
        pixelX >= 0 &&
        pixelX <= rect.width &&
        pixelY >= 0 &&
        pixelY <= rect.height;

      const leftPercent = (pixelX / rect.width) * 100;
      const topPercent = (pixelY / rect.height) * 100;
      const { xPosition, yPosition } = getXYFromPosition(
        leftPercent,
        topPercent,
        greenhouseDimensions,
      );

      return { isValid, leftPercent, topPercent, xPosition, yPosition };
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
      const result = getDropResult(resolvedItemMap.get(slotId), event.delta);
      setInvalidPreviewId(result?.isValid === false ? slotId : null);
    },
    [getDropResult, resolvedItemMap],
  );

  const handleDragCancel = React.useCallback(() => {
    setActiveDragId(null);
    setInvalidPreviewId(null);
    releaseClickSuppression();
  }, [releaseClickSuppression]);

  const handleDragEnd = React.useCallback(
    async (event: DragEndEvent) => {
      const slotId = String(event.active.id);
      const item = resolvedItemMap.get(slotId);
      const result = getDropResult(item, event.delta);

      setActiveDragId(null);
      setInvalidPreviewId(null);
      releaseClickSuppression();

      if (!item?.slot || !result) return;
      const slot = item.slot;

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
      // Prefer the RAW device/greenhouse from slot.meta over the slot id, whose
      // whitespace is normalized to `_` — otherwise the commit persists against
      // the wrong greenhouse for names with spaces (e.g. "Greenhouse Kazuti").
      const rawDevice =
        (slot.meta?.device as string | undefined) ||
        parsedSlot.device ||
        item.deviceId;
      const rawGreenhouse =
        (slot.meta?.greenhouse as string | undefined) ?? parsedSlot.greenhouse;

      try {
        await Promise.resolve(
          onSensorPositionCommit({
            slotId: slot.id,
            deviceId: rawDevice,
            greenhouse: rawGreenhouse,
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
      resolvedItemMap,
      triggerInvalidFeedback,
    ],
  );

  const showTooltip = activeDragId == null;
  const showInvalidCanvasState =
    invalidPreviewId != null || canvasInvalidFlash || invalidFlashId != null;

  return {
    mapRef,
    sensorsConfig,
    resolvedItems,
    resolvedItemMap,
    dndHandlers: {
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragCancel: handleDragCancel,
      onDragEnd: (event) => void handleDragEnd(event),
    },
    activeDragId,
    invalidPreviewId,
    invalidFlashId,
    showTooltip,
    showInvalidCanvasState,
    handleSuppressibleClick,
  };
}
