'use client';

import {
  valueToHotColor,
  getParameterUnit,
  formatParameterDisplayValue,
} from '@/lib/farm-data';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { idwInterpolate } from '@/lib/heatmap-utils';
import { useFullMapData } from './view-single-bay.hooks';
import type { ViewSingleBayProps } from './view-single-bay.types';
import { getLegendScale } from '@/components/farm-overview/parameter-color-legend';

const HEATMAP_GRID_COLS = 80;
const HEATMAP_GRID_ROWS = 40;

export function ViewSingleBay({
  bays,
  parameter,
  selectedSlotId,
  onSelectSlot,
  className,
  showOnlyFilledPositions = false,
}: ViewSingleBayProps) {
  const { t } = useI18n();
  const unit = getParameterUnit(parameter);
  const { sensors, heatmapPoints, globalMin, globalMax, hasAnyData } =
    useFullMapData(bays, parameter, showOnlyFilledPositions);

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
        'flex h-full min-h-0 w-full gap-0 overflow-hidden border border-border/40 py-0',
        'bg-white dark:bg-background',
        className,
      )}
    >
      {!hasAnyData ? (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
          {t.pages.farmOverview.noData}
        </div>
      ) : (
        <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
          <div
            className="absolute inset-0 grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${HEATMAP_GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${HEATMAP_GRID_ROWS}, 1fr)`,
            }}
          >
            {heatmapGrid.map((row, i) =>
              row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className="min-w-0 min-h-0"
                  style={{
                    backgroundColor: Number.isNaN(val)
                      ? 'rgb(240,240,240)'
                      : valueToHotColor(val, scaleMin, scaleMax),
                  }}
                />
              )),
            )}
          </div>
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
              return (
                <Button
                  key={positionKey}
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    onSelectSlot(slot ? (isSelected ? null : slot.id) : null)
                  }
                  disabled={!slot}
                  title={
                    slot && value != null
                      ? `${deviceId}: ${displayValue}${unit ? ` ${unit}` : ''}`
                      : deviceId
                  }
                  className={cn(
                    'absolute inline-flex flex-col items-center justify-center px-0.5',
                    'h-auto border-none bg-transparent hover:bg-transparent',
                    'text-[10px] sm:text-[14px] font-bold tabular-nums text-black',
                    'drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]',
                    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    slot && 'cursor-pointer',
                    isSelected && 'ring-2 ring-primary ring-offset-1 rounded',
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
                        <span className="text-[10px] font-medium opacity-85 leading-tight">
                          {unit}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span>--</span>
                  )}
                </Button>
              );
            },
          )}
        </div>
      )}
    </Card>
  );
}
