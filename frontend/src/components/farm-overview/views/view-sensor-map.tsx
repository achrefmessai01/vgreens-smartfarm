'use client';

import {
  formatParameterDisplayValue,
  getParameterColor,
  getParameterUnit,
} from '@/lib/farm-data';
import type { ParameterType, PlantSlot } from '@/lib/farm-types';
import { isParameterSupportedByType } from '@/lib/sensor-map-parameter';
import {
  BAY_COUNT,
  ROWS_PER_BAY,
  SENSOR_MAP_POSITIONS,
  getBayRowFromPosition,
  getMapDeviceId,
} from '@/lib/sensor-map-positions';
import { buildDeviceToSlotMap } from '@/lib/sensor-map-utils';
import { cn } from '@/lib/utils';
import type { ViewSensorMapProps } from '@/types/sensor-map';
import * as React from 'react';

interface CellItem {
  slot: PlantSlot | null;
  deviceId: string;
  value: number | null;
}

function buildBayRowToSlots(
  bay: ViewSensorMapProps['bay'],
  parameter: ParameterType,
  showOnlyFilledPositions: boolean,
): Map<string, CellItem[]> {
  const deviceToSlot = bay ? buildDeviceToSlotMap(bay) : new Map();
  const map = new Map<string, CellItem[]>();

  for (const pos of SENSOR_MAP_POSITIONS) {
    if (!isParameterSupportedByType(parameter, pos.type)) continue;
    const slot = deviceToSlot.get(getMapDeviceId(pos.deviceId)) ?? null;
    if (!slot && showOnlyFilledPositions) continue;
    const value =
      slot && typeof slot.values?.[parameter] === 'number'
        ? (slot.values[parameter] as number)
        : null;
    if (slot && (typeof value !== 'number' || Number.isNaN(value))) continue;

    const { bayIndex, rowIndex } = getBayRowFromPosition(pos);
    const key = `${bayIndex}-${rowIndex}`;
    const list = map.get(key) ?? [];
    list.push({ slot, deviceId: pos.deviceId, value });
    map.set(key, list);
  }
  return map;
}

export function ViewSensorMap(props: ViewSensorMapProps) {
  const { parameter, selectedSlotId, onSelectSlot, className } = props;
  const unit = getParameterUnit(parameter);
  const bayRowToSlots = React.useMemo(
    () =>
      buildBayRowToSlots(
        props.bay,
        props.parameter,
        props.showOnlyFilledPositions ?? false,
      ),
    [props.bay, props.parameter, props.showOnlyFilledPositions],
  );

  return (
    <div
      className={cn(
        'flex flex-1 min-h-0 w-full h-full rounded-lg border border-border/40 bg-background overflow-hidden',
        className,
      )}
    >
      {Array.from({ length: BAY_COUNT }, (_, bayIndex) => (
        <div
          key={bayIndex}
          className={cn(
            'flex flex-1 flex-col min-w-0 border-r border-border/60 last:border-r-0',
          )}
        >
          {Array.from({ length: ROWS_PER_BAY }, (_, rowIndex) => {
            const key = `${bayIndex}-${rowIndex}`;
            const items = bayRowToSlots.get(key) ?? [];
            return (
              <div
                key={rowIndex}
                className="flex flex-1 min-h-[72px] items-center justify-center gap-1 p-1 flex-wrap"
              >
                {items.map(({ slot, deviceId, value }) => {
                  const isSelected = slot ? selectedSlotId === slot.id : false;
                  const glowColor = slot
                    ? getParameterColor(value ?? 0, parameter, slot.id)
                    : 'rgb(200, 200, 200)';
                  const textGlow = slot
                    ? `0 0 6px ${glowColor}, 0 0 12px ${glowColor}, 0 0 20px ${glowColor}`
                    : 'none';
                  const textColor = slot
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))';
                  return (
                    <button
                      key={deviceId}
                      type="button"
                      onClick={() =>
                        onSelectSlot(
                          slot ? (isSelected ? null : slot.id) : null,
                        )
                      }
                      disabled={!slot}
                      title={
                        slot && value != null
                          ? `${deviceId}: ${formatParameterDisplayValue(value)}${unit}`
                          : deviceId
                      }
                      className={cn(
                        'flex flex-col items-center justify-center transition-all duration-200 tabular-nums bg-transparent border-0 min-w-0 py-1 px-2',
                        'hover:scale-110 hover:brightness-110',
                        isSelected &&
                          'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md scale-105',
                        !slot && 'cursor-not-allowed opacity-60',
                      )}
                      style={{
                        color: textColor,
                        textShadow: textGlow,
                      }}
                    >
                      {value != null ? (
                        <>
                          <span className="text-base font-bold leading-tight tracking-tight">
                            {formatParameterDisplayValue(value)}
                          </span>
                          <span className="text-[11px] font-medium opacity-95 -mt-0.5">
                            {unit}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm">--</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
