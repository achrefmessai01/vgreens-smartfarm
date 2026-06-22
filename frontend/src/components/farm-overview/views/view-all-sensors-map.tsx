'use client';

import * as React from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Cpu,
  Sprout,
  Sun,
  SunMedium,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { STATE_BADGE_CLASS } from '@/components/devices/device-status-constants';
import { useDeviceStatusesQuery } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import {
  formatParameterDisplayValue,
  getParameterColor,
} from '@/lib/farm-data';
import { useAllSensorsMapData } from '@/lib/hooks/use-all-sensors-map-data';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  type GreenhouseDimensions,
  isKnownSensorDevice,
  parseLiveSensorSlotId,
  type SensorMapType,
} from '@/lib/sensor-map-positions';
import { cn } from '@/lib/utils';
import type { Bay } from '@/types/farm.types';
import type { SensorPositionCommit } from '@/types/sensor-map';
import type { AllSensorMarker } from '@/types/view-single-bay.types';
import {
  BayDividerLines,
  getPositionFromPercents,
  SensorPositionTooltipContent,
  useSensorMapDrag,
} from './sensor-map-shared';

/**
 * Per-sensor-family icon + color so each marker is distinguishable at a glance:
 * a colored, icon-bearing pill instead of an anonymous dot.
 */
const SENSOR_TYPE_STYLE: Record<
  SensorMapType,
  { Icon: LucideIcon; circleBg: string; glow: string }
> = {
  air: {
    Icon: Wind,
    circleBg: 'bg-sky-300/90',
    glow: 'rgba(56, 189, 248, 0.55)',
  },
  soil: {
    Icon: Sprout,
    circleBg: 'bg-emerald-300/90',
    glow: 'rgba(52, 211, 153, 0.55)',
  },
  lux: {
    Icon: Sun,
    circleBg: 'bg-amber-300/90',
    glow: 'rgba(251, 191, 36, 0.6)',
  },
  par: {
    Icon: SunMedium,
    circleBg: 'bg-yellow-300/90',
    glow: 'rgba(250, 204, 21, 0.6)',
  },
};

/**
 * Edge gateways get a distinct device icon, not a sensor one. Anything that
 * isn't a recognized sensor family (Air / Soil / Lux) — `vgreens-XX-XX`,
 * `knaup-XX`, etc. — is treated as an edge device.
 */
const EDGE_STYLE: { Icon: LucideIcon; circleBg: string; glow: string } = {
  Icon: Cpu,
  circleBg: 'bg-violet-300/90',
  glow: 'rgba(167, 139, 250, 0.6)',
};

function isEdgeDevice(deviceId: string): boolean {
  return !isKnownSensorDevice(deviceId);
}

/** Liveness status for an edge device, sourced from `deviceStatuses`. */
interface DeviceLivenessStatus {
  state: string;
  lastAlive?: string | null;
  lastRealData?: string | null;
}

export interface ViewAllSensorsMapProps {
  bay: Bay;
  /** VGreens-admin tenant override forwarded to the device-status query. */
  tenantId?: string | null;
  /** Disabled InfluxDB `_field` set from the "Enable Sensors" dropdown. */
  disabledSensorFields: Set<string>;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string | null) => void;
  onSensorPositionCommit: (
    payload: SensorPositionCommit,
  ) => Promise<void> | void;
  className?: string;
  greenhouseDimensions?: GreenhouseDimensions | null;
  savingDeviceId?: string | null;
  positionErrorDeviceId?: string | null;
  invalidDropTitle?: string;
  invalidDropDescription?: string;
  readOnly?: boolean;
}

interface AllSensorsMarkerProps {
  marker: AllSensorMarker;
  greenhouseDimensions: GreenhouseDimensions;
  selectedSlotId: string | null;
  onSuppressibleClick: (slotId: string | null) => void;
  onSensorPositionCommit: ViewAllSensorsMapProps['onSensorPositionCommit'];
  activeDragId: string | null;
  invalidPreviewId: string | null;
  invalidFlashId: string | null;
  savingDeviceId?: string | null;
  positionErrorDeviceId?: string | null;
  showTooltip: boolean;
  noValuesLabel: string;
  status?: DeviceLivenessStatus | null;
  readOnly?: boolean;
}

/** Relative "x ago" from an ISO timestamp, using the device-status dictionary. */
function formatLastSeen(
  iso: string | null | undefined,
  rel: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  },
  neverLabel: string,
): string {
  if (!iso) return neverLabel;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return neverLabel;
  const diffMin = Math.max(0, (Date.now() - ms) / 60_000);
  if (diffMin < 1) return rel.justNow;
  if (diffMin < 60)
    return rel.minutesAgo.replace('{n}', String(Math.round(diffMin)));
  const diffH = diffMin / 60;
  if (diffH < 48) return rel.hoursAgo.replace('{n}', String(Math.round(diffH)));
  return rel.daysAgo.replace('{n}', String(Math.round(diffH / 24)));
}

/** Hover content: device name, current measurements (or edge status), and the x/y editor. */
function SensorOverviewTooltip({
  marker,
  greenhouseDimensions,
  xPosition,
  yPosition,
  readOnly,
  saving,
  noValuesLabel,
  status,
  onSave,
}: {
  marker: AllSensorMarker;
  greenhouseDimensions: GreenhouseDimensions;
  xPosition: number;
  yPosition: number;
  readOnly?: boolean;
  saving?: boolean;
  noValuesLabel: string;
  status?: DeviceLivenessStatus | null;
  onSave?: (xPosition: number, yPosition: number) => Promise<void>;
}) {
  const { t } = useI18n();
  const ds = t.pages.deviceStatus;
  const stateLabel =
    (
      {
        working: ds.states.working,
        stale: ds.states.stale,
        'heartbeat-only': ds.states.heartbeatOnly,
        'never-seen': ds.states.neverSeen,
      } as Record<string, string>
    )[status?.state ?? ''] ?? status?.state;

  return (
    <div className="w-56 space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
            {marker.deviceId}
          </span>
          {status && (
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 text-[9px] font-medium',
                STATE_BADGE_CLASS[status.state],
              )}
            >
              {stateLabel}
            </Badge>
          )}
        </div>

        {marker.measurements.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {marker.measurements.map((m) => (
              <div
                key={m.field}
                className="flex flex-col border-l-2 pl-1.5 leading-tight"
                style={{ borderColor: getParameterColor(m.value, m.field) }}
              >
                <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  {m.label}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatParameterDisplayValue(m.value)}
                  <span className="text-muted-foreground ml-0.5 text-[10px] font-medium">
                    {m.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : !status ? (
          <div className="text-muted-foreground text-xs">{noValuesLabel}</div>
        ) : null}

        {status && (
          <div className="text-muted-foreground flex items-center justify-between gap-2 text-[11px]">
            <span>{ds.charts.freshnessTitle}</span>
            <span className="text-foreground tabular-nums">
              {formatLastSeen(
                status.lastAlive ?? status.lastRealData,
                ds.relative,
                ds.table.never,
              )}
            </span>
          </div>
        )}
      </div>

      <SensorPositionTooltipContent
        deviceId={marker.deviceId}
        currentXPosition={xPosition}
        currentYPosition={yPosition}
        greenhouseDimensions={greenhouseDimensions}
        readOnly={readOnly}
        saving={saving}
        onSave={onSave}
        hideDeviceHeader
      />
    </div>
  );
}

function AllSensorsMarker({
  marker,
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
  noValuesLabel,
  status,
  readOnly,
}: AllSensorsMarkerProps) {
  const { slot, deviceId, leftPercent, topPercent, slotId, type } = marker;
  const isSelected = selectedSlotId === slot.id;
  const isDraggingThis = activeDragId === slotId;
  const isInvalidPreview = invalidPreviewId === slotId;
  const isInvalidFlash = invalidFlashId === slotId;
  const isSaving = savingDeviceId === deviceId;
  const hasPersistError = positionErrorDeviceId === deviceId;
  const isError = isInvalidPreview || isInvalidFlash || hasPersistError;
  const { Icon, circleBg, glow } = isEdgeDevice(deviceId)
    ? EDGE_STYLE
    : SENSOR_TYPE_STYLE[type];
  const { xPosition, yPosition } = getPositionFromPercents(
    leftPercent,
    topPercent,
    greenhouseDimensions,
  );

  const tooltipContent = (
    <SensorOverviewTooltip
      marker={marker}
      greenhouseDimensions={greenhouseDimensions}
      xPosition={xPosition}
      yPosition={yPosition}
      readOnly={readOnly}
      saving={isSaving}
      noValuesLabel={noValuesLabel}
      status={status}
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
  );

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: slotId,
    disabled: isSaving || !!readOnly,
  });

  const translate = transform ? CSS.Translate.toString(transform) : '';
  const circleClasses = cn(
    'flex items-center justify-center rounded-full border border-white/40 text-slate-900',
    'h-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)] w-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)]',
    circleBg,
    'transition-[transform,box-shadow] duration-200 ease-out',
    isSelected && 'ring-2 ring-white/90',
    isSaving && 'animate-pulse ring-2 ring-cyan-500/60',
    isError && 'bg-destructive/20 text-destructive ring-2 ring-destructive/80',
  );

  const wrapperClasses = cn(
    'absolute flex select-none flex-col items-center gap-0.5 focus-visible:outline-none',
    !isDraggingThis && !isSaving && !readOnly && 'cursor-grab hover:scale-105',
    isDraggingThis && 'z-30 scale-110 cursor-grabbing',
    !isDraggingThis && isSelected && 'z-20',
  );

  const boxShadow = isError
    ? '0 0 0 1px rgba(220, 38, 38, 0.5), 0 0 22px rgba(220, 38, 38, 0.28)'
    : isDraggingThis
      ? `0 18px 34px rgba(15, 23, 42, 0.28), 0 0 22px ${glow}`
      : `0 0 14px ${glow}, 0 0 22px ${glow}`;

  const button = (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onSuppressibleClick(isSelected ? null : slot.id)}
      className={wrapperClasses}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: translate
          ? `translate(-50%, -50%) ${translate}`
          : 'translate(-50%, -50%)',
        transition:
          'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms ease, opacity 180ms ease',
        touchAction: 'none',
      }}
      aria-busy={isSaving}
      aria-label={deviceId}
      {...attributes}
      {...listeners}
    >
      <span className={circleClasses} style={{ boxShadow }}>
        <Icon className="h-[45%] w-[45%]" aria-hidden />
      </span>
      <span className="bg-background/80 text-foreground pointer-events-none max-w-[5.5rem] truncate rounded px-1 py-px text-[9px] leading-tight font-medium shadow-sm">
        {deviceId}
      </span>
    </button>
  );

  return showTooltip ? (
    <Tooltip content={tooltipContent} interactive className="px-3 py-2">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export function ViewAllSensorsMap({
  bay,
  tenantId,
  disabledSensorFields,
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
}: ViewAllSensorsMapProps) {
  const { t } = useI18n();
  const farmOverviewT = t.pages.farmOverview;
  const { isVGreensAdmin } = useCurrentUser();
  const isReadOnly = readOnly || !isVGreensAdmin;

  const { markers } = useAllSensorsMapData(
    bay,
    disabledSensorFields,
    greenhouseDimensions,
  );

  // Every marker shows its device liveness status on hover. Only fetch the
  // (heavier) device-status inventory when the map actually has markers.
  const { data: deviceStatusData } = useDeviceStatusesQuery({
    variables: { input: { tenantId: tenantId ?? undefined } },
    skip: markers.length === 0,
    fetchPolicy: 'cache-and-network',
  });
  const statusByDevice = React.useMemo(() => {
    const map = new Map<string, DeviceLivenessStatus>();
    for (const s of deviceStatusData?.deviceStatuses ?? []) {
      map.set(s.device, {
        state: s.state,
        lastAlive: s.lastAlive ?? null,
        lastRealData: s.lastRealData ?? null,
      });
    }
    return map;
  }, [deviceStatusData?.deviceStatuses]);

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
  } = useSensorMapDrag<AllSensorMarker>({
    items: markers,
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
            {resolvedItems.map((marker) => (
              <AllSensorsMarker
                key={marker.slotId}
                marker={marker}
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
                noValuesLabel={farmOverviewT.noData}
                status={statusByDevice.get(marker.deviceId) ?? null}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
