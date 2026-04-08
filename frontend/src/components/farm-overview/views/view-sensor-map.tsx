'use client';

import { Tooltip } from '@/components/ui/tooltip';
import {
  formatParameterDisplayValue,
  getParameterColor,
  getParameterUnit,
} from '@/lib/farm-data';
import { useFullMapData } from '@/lib/hooks/use-full-map-data';
import { cn } from '@/lib/utils';
import type { ViewSensorMapProps } from '@/types/sensor-map';

export function ViewSensorMap(props: ViewSensorMapProps) {
  const { parameter, selectedSlotId, onSelectSlot, className, greenhouseDimensions } = props;
  const unit = getParameterUnit(parameter);

  const { sensors } = useFullMapData(
    props.bay ? [props.bay] : [],
    parameter,
    props.showOnlyFilledPositions ?? false,
    greenhouseDimensions,
  );

  if (!greenhouseDimensions) {
    return (
      <div className={cn('border-border/40 bg-card flex h-full w-full flex-1 items-center justify-center rounded-xl border shadow-sm', className)}>
        <p className="text-muted-foreground text-sm">Configure greenhouse dimensions to view layout</p>
      </div>
    );
  }

  const { xDimension, yDimension } = greenhouseDimensions;

  return (
    <div
      className={cn(
        'border-border/40 bg-card flex min-h-0 w-full flex-1 items-start justify-start overflow-hidden rounded-xl border shadow-sm',
        className,
      )}
    >
      {sensors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sensor data</p>
      ) : (
        // Canvas: flex child — height fills parent, width set by aspect-ratio
        <div
          className="relative overflow-hidden"
          style={{
            height: '100%',
            aspectRatio: `${xDimension} / ${yDimension}`,
            maxWidth: '100%',
          }}
        >
          {sensors.map(({ slot, deviceId, value, leftPercent, topPercent, positionKey }) => {
            const isSelected = slot ? selectedSlotId === slot.id : false;
            const glowColor = slot
              ? getParameterColor(value ?? 0, parameter, slot.id)
              : 'rgb(200, 200, 200)';
            const tip =
              slot && value != null
                ? `${deviceId}: ${formatParameterDisplayValue(value)}${unit}`
                : deviceId;
            return (
              <Tooltip key={positionKey} content={tip}>
                <button
                  type="button"
                  onClick={() =>
                    onSelectSlot(slot ? (isSelected ? null : slot.id) : null)
                  }
                  className={cn(
                    'absolute flex flex-col items-center justify-center rounded-full tabular-nums',
                    'h-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)] w-[clamp(1.875rem,0.9vw+1.3rem,2.25rem)]',
                    'transition-transform duration-150',
                    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
                    slot
                      ? 'bg-cyan-300/90 text-slate-900 hover:scale-105 cursor-pointer'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                    isSelected && 'scale-110',
                  )}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: slot
                      ? `0 0 14px ${glowColor}, 0 0 24px ${glowColor}`
                      : 'none',
                  }}
                >
                  {value != null ? (
                    <>
                      <span className="text-[clamp(0.625rem,0.18vw+0.58rem,0.75rem)] leading-tight font-semibold tracking-tight">
                        {formatParameterDisplayValue(value)}
                      </span>
                      <span className="-mt-0.5 text-[clamp(0.5rem,0.08vw+0.45rem,0.5625rem)] font-medium">
                        {unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-[clamp(0.5625rem,0.1vw+0.52rem,0.625rem)]">--</span>
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}
