'use client';

import * as React from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n';
import {
  formatParameterDisplayValue,
  getParameterColor,
  getParameterUnit,
} from '@/lib/farm-data';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useFullMapData } from '@/lib/hooks/use-full-map-data';
import {
  type GreenhouseDimensions,
  parseLiveSensorSlotId,
} from '@/lib/sensor-map-positions';
import { cn } from '@/lib/utils';
import type { ViewSensorMapProps } from '@/types/sensor-map';
import type { SensorWithPosition } from '@/types/view-single-bay.types';
import {
  BayDividerLines,
  getPositionFromPercents,
  SensorPositionTooltipContent,
  useSensorMapDrag,
  type DraggableSensorItem,
} from './sensor-map-shared';

interface ResolvedSensor extends SensorWithPosition, DraggableSensorItem {
  slotId: string;
  leftPercent: number;
  topPercent: number;
}

interface SensorPillProps {
  sensor: ResolvedSensor;
  parameter: string;
  unit: string;
  greenhouseDimensions: GreenhouseDimensions;
  selectedSlotId: string | null;
  onSuppressibleClick: (slotId: string | null) => void;
  onSensorPositionCommit: ViewSensorMapProps['onSensorPositionCommit'];
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
  greenhouseDimensions,
  selectedSlotId,
  onSuppressibleClick,
  onSensorPositionCommit,
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
  const { xPosition, yPosition } = getPositionFromPercents(
    leftPercent,
    topPercent,
    greenhouseDimensions,
  );
  const glowColor = slot
    ? getParameterColor(value ?? 0, parameter, slot.id)
    : 'rgb(200, 200, 200)';
  const tooltipContent =
    slot != null ? (
      <SensorPositionTooltipContent
        deviceId={deviceId}
        currentXPosition={xPosition}
        currentYPosition={yPosition}
        greenhouseDimensions={greenhouseDimensions}
        readOnly={readOnly}
        saving={isSaving}
        onSave={
          readOnly
            ? undefined
            : async (nextXPosition, nextYPosition) => {
                const parsedSlot = parseLiveSensorSlotId(slot.id);
                await Promise.resolve(
                  onSensorPositionCommit({
                    slotId: slot.id,
                    deviceId: parsedSlot.device || deviceId,
                    greenhouse: parsedSlot.greenhouse,
                    xPosition: nextXPosition,
                    yPosition: nextYPosition,
                  }),
                );
              }
        }
      />
    ) : (
      deviceId
    );

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
    slot &&
      !isDraggingThis &&
      !isSaving &&
      !readOnly &&
      'cursor-grab hover:scale-105',
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
        <Tooltip
          content={tooltipContent}
          interactive={slot != null && !readOnly}
          className={slot ? 'px-3 py-2' : undefined}
        >
          {button}
        </Tooltip>
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
  const { t } = useI18n();
  const farmOverviewT = t.pages.farmOverview;
  const { isVGreensAdmin } = useCurrentUser();
  const isReadOnly = readOnly || !isVGreensAdmin;
  const unit = getParameterUnit(parameter);

  const { sensors } = useFullMapData(
    props.bay ? [props.bay] : [],
    parameter,
    props.showOnlyFilledPositions ?? false,
    greenhouseDimensions,
  );

  const items = React.useMemo<ResolvedSensor[]>(
    () =>
      sensors.map((sensor) => ({
        ...sensor,
        slotId: sensor.slot?.id ?? sensor.positionKey,
      })),
    [sensors],
  );

  const {
    mapRef,
    sensorsConfig,
    resolvedItems,
    dndHandlers,
    activeDragId,
    invalidPreviewId,
    invalidFlashId,
    showTooltip,
    showInvalidCanvasState,
    handleSuppressibleClick,
  } = useSensorMapDrag<ResolvedSensor>({
    items,
    greenhouseDimensions,
    onSensorPositionCommit,
    onSelectSlot,
    invalidDropTitle,
    invalidDropDescription,
  });

  if (!greenhouseDimensions) {
    return (
      <div
        className={cn(
          'border-border/40 bg-card flex h-full w-full flex-1 items-center justify-center rounded-xl border shadow-sm',
          className,
        )}
      >
        <p className="text-muted-foreground text-sm">
          {farmOverviewT.configureDimensionsHint}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border/40 bg-card flex min-h-0 w-full flex-1 items-start justify-start overflow-hidden rounded-xl border shadow-sm transition-colors duration-200',
        showInvalidCanvasState && 'border-destructive/60 bg-destructive/5',
        className,
      )}
    >
      {resolvedItems.length === 0 ? (
        <p className="text-muted-foreground text-sm">{farmOverviewT.noData}</p>
      ) : (
        <DndContext sensors={sensorsConfig} {...dndHandlers}>
          <div ref={mapRef} className="relative h-full w-full overflow-hidden">
            <BayDividerLines greenhouseDimensions={greenhouseDimensions} />
            {resolvedItems.map((sensor) => (
              <SensorPill
                key={sensor.slotId}
                sensor={sensor}
                parameter={parameter}
                unit={unit}
                greenhouseDimensions={greenhouseDimensions}
                selectedSlotId={selectedSlotId}
                onSuppressibleClick={handleSuppressibleClick}
                onSensorPositionCommit={onSensorPositionCommit}
                activeDragId={activeDragId}
                invalidPreviewId={invalidPreviewId}
                invalidFlashId={invalidFlashId}
                savingDeviceId={savingDeviceId}
                positionErrorDeviceId={positionErrorDeviceId}
                showTooltip={showTooltip}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
