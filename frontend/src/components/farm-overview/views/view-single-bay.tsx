'use client';

import { getLegendScale } from '@/components/farm-overview/parameter-color-legend';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useI18n } from '@/i18n';
import { formatParameterDisplayValue, getParameterUnit } from '@/lib/farm-data';
import { idwInterpolate } from '@/lib/heatmap-utils';
import { useFullMapData } from '@/lib/hooks/use-full-map-data';
import { cn } from '@/lib/utils';
import type { ViewSingleBayProps } from '@/types/view-single-bay.types';
import * as React from 'react';
import { HeatmapBackground } from './heatmap-background';

const HEATMAP_GRID_COLS = 80;
const HEATMAP_GRID_ROWS = 40;

export function ViewSingleBay({
  bays,
  parameter,
  selectedSlotId,
  onSelectSlot,
  className,
  showOnlyFilledPositions = false,
  greenhouseDimensions,
}: ViewSingleBayProps) {
  const { t } = useI18n();
  const unit = getParameterUnit(parameter);
  const { sensors, heatmapPoints, globalMin, globalMax, hasAnyData } =
    useFullMapData(
      bays,
      parameter,
      showOnlyFilledPositions,
      greenhouseDimensions,
    );

  const heatmapGrid = React.useMemo(
    () =>
      idwInterpolate(HEATMAP_GRID_COLS, HEATMAP_GRID_ROWS, heatmapPoints, 2),
    [heatmapPoints],
  );

  const scale = getLegendScale(parameter);
  const scaleMin = scale?.min ?? globalMin;
  const scaleMax = scale?.max ?? globalMax;

  return (
    <Card
      className={cn(
        'border-border/40 flex h-full min-h-0 w-full gap-0 overflow-hidden border py-0',
        'dark:bg-background bg-white',
        className,
      )}
    >
      {!hasAnyData ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center p-4 text-sm">
          {t.pages.farmOverview.noData}
        </div>
      ) : (
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="relative h-full w-full overflow-hidden">
            {greenhouseDimensions?.bayCount != null &&
              greenhouseDimensions.bayCount > 1 &&
              Array.from({ length: greenhouseDimensions.bayCount - 1 }, (_, i) => (
                <div
                  key={`bay-line-${i}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 z-10 w-px bg-foreground/15"
                  style={{
                    left: `${((i + 1) / greenhouseDimensions.bayCount!) * 100}%`,
                  }}
                />
              ))}
            <HeatmapBackground
              grid={heatmapGrid}
              scaleMin={scaleMin}
              scaleMax={scaleMax}
              cols={HEATMAP_GRID_COLS}
              rows={HEATMAP_GRID_ROWS}
            />
            {sensors.map(
              ({
                slot,
                deviceId,
                value,
                leftPercent,
                topPercent,
                positionKey,
              }) => {
                const isSelected = slot && selectedSlotId === slot.id;
                const displayValue =
                  value != null ? formatParameterDisplayValue(value) : '--';
                const tip =
                  slot && value != null
                    ? `${deviceId}: ${displayValue}${unit ? ` ${unit}` : ''}`
                    : deviceId;
                return (
                  <Tooltip key={positionKey} content={tip}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        onSelectSlot(
                          slot ? (isSelected ? null : slot.id) : null,
                        )
                      }
                      disabled={!slot}
                      className={cn(
                        'absolute inline-flex flex-col items-center justify-center px-0.5',
                        'h-auto border-none bg-transparent hover:bg-transparent',
                        'text-[10px] font-bold text-black tabular-nums sm:text-[14px]',
                        'drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]',
                        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1',
                        slot && 'cursor-pointer',
                        isSelected &&
                          'ring-primary rounded ring-2 ring-offset-1',
                      )}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        transform: 'translate(-50%, -58%)',
                      }}
                      aria-label={
                        slot && value != null
                          ? `${displayValue} ${unit}`
                          : t.pages.farmOverview.noSensor
                      }
                    >
                      {value != null ? (
                        <>
                          <span className="leading-tight tracking-tight">
                            {displayValue}
                          </span>
                          {unit ? (
                            <span className="text-[10px] leading-tight font-medium opacity-85">
                              {unit}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span>--</span>
                      )}
                    </Button>
                  </Tooltip>
                );
              },
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
