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
  getSlotPositionsFromBay,
  bayHasDynamicPositions,
} from '@/lib/sensor-map-positions';
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
  const map = new Map<string, CellItem[]>();

  if (bay && bayHasDynamicPositions(bay)) {
    const positions = getSlotPositionsFromBay(bay);
    for (const p of positions) {
      if (!isParameterSupportedByType(parameter, p.type)) continue;
      const value =
        typeof p.slot.values?.[parameter] === 'number'
          ? (p.slot.values[parameter] as number)
          : null;
      const numValue = value != null && !Number.isNaN(value) ? value : null;
      if (showOnlyFilledPositions && numValue == null) continue;
      const key = `${p.bayIndex}-${p.rowIndex}`;
      const list = map.get(key) ?? [];
      list.push({ slot: p.slot, deviceId: p.deviceId, value: numValue });
      map.set(key, list);
    }
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
        'flex flex-1 min-h-0 w-full h-full rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden',
        className,
      )}
    >
      <div className="flex h-full w-full min-h-0 min-w-0 px-0 pt-0 pb-0.5 sm:px-0.5 sm:pt-0 sm:pb-1.5">
        {Array.from({ length: BAY_COUNT }, (_, bayIndex) => (
          <div
            key={bayIndex}
            className={cn(
              'flex flex-1 flex-col min-w-0 border-r border-border/40 last:border-r-0',
            )}
          >
            {Array.from({ length: ROWS_PER_BAY }, (_, rowIndex) => {
              const key = `${bayIndex}-${rowIndex}`;
              const items = bayRowToSlots.get(key) ?? [];
              return (
                <div
                  key={rowIndex}
                  className="flex flex-1 min-h-0 flex-wrap items-center justify-center gap-0.5 p-0.5 sm:gap-1.5 sm:p-1.5 lg:gap-2 lg:p-2"
                >
                  {items.map(({ slot, deviceId, value }) => {
                    const isSelected = slot ? selectedSlotId === slot.id : false;
                    const glowColor = slot
                      ? getParameterColor(value ?? 0, parameter, slot.id)
                      : 'rgb(200, 200, 200)';
                    const circleGlow = slot
                      ? `0 0 14px ${glowColor}, 0 0 24px ${glowColor}`
                      : 'none';
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
                          'relative flex min-w-0 items-center justify-center transition-transform duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          'disabled:cursor-not-allowed',
                          'hover:scale-105',
                          isSelected && 'scale-110',
                          !slot && 'opacity-50',
                          rowIndex === ROWS_PER_BAY - 1 &&
                            '-translate-y-1 sm:-translate-y-[0.375rem]',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-5.5 w-5.5 shrink-0 flex-col items-center justify-center rounded-full px-0.5 tabular-nums sm:h-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)] sm:w-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)] sm:px-1',
                            slot
                              ? 'bg-cyan-300/90 text-slate-900'
                              : 'bg-muted text-muted-foreground',
                          )}
                          style={{
                            boxShadow: circleGlow,
                          }}
                        >
                          {value != null ? (
                            <>
                              <span className="text-[7px] font-semibold leading-tight tracking-tight sm:text-[clamp(0.625rem,0.18vw+0.58rem,0.75rem)]">
                                {formatParameterDisplayValue(value)}
                              </span>
                              <span className="hidden text-[9px] font-medium -mt-0.5 sm:inline sm:text-[clamp(0.5rem,0.08vw+0.45rem,0.5625rem)]">
                                {unit}
                              </span>
                            </>
                          ) : (
                            <span className="text-[7px] sm:text-[clamp(0.5625rem,0.1vw+0.52rem,0.625rem)]">
                              --
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
