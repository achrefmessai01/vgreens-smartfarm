'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatFieldToLabel } from '@/lib/farm-data';
import type { ParameterType } from '@/types/farm.types';
import { useI18n } from '@/i18n';

interface SensorHoverCardProps {
  parameter: ParameterType;
  value: number;
  unit?: string;
  slotId: string;
  meta?: Record<string, unknown>;
  children: React.ReactNode;
}

function parseSlotId(slotId: string) {
  const after = slotId.replace(/^live_/, '');
  const [chamber, device, level] = after.split('|');
  return {
    chamber: chamber || undefined,
    device: device || undefined,
    level: level || undefined,
  };
}

export function SensorHoverCard({
  parameter,
  value,
  unit,
  slotId,
  meta,
  children,
}: SensorHoverCardProps) {
  const { t } = useI18n();
  const { chamber, device, level } = parseSlotId(slotId);

  const metaInfo = meta ?? {};
  const start = (metaInfo._start as string) || undefined;
  const stop = (metaInfo._stop as string) || undefined;
  const time = (metaInfo._time as string) || undefined;
  const measurement = (metaInfo._measurement as string) || undefined;
  const area = (metaInfo.area as string) || undefined;
  const profile = (metaInfo.profile as string) || undefined;
  const side = (metaInfo.side as string) || undefined;

  return (
    <div className="group relative">
      {children}
      <div
        className={cn(
          'pointer-events-none absolute -top-2 left-1/2 z-30 -translate-x-1/2 -translate-y-full',
          'opacity-0 group-hover:-translate-y-[0.3rem] group-hover:opacity-100',
          'transition-all duration-150 ease-out',
        )}
      >
        <div className="bg-popover text-popover-foreground border-border/60 min-w-[200px] rounded-xl border px-3 py-2 text-xs shadow-xl">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="truncate font-semibold">
              {formatFieldToLabel(parameter)}
            </span>
          </div>
          <div className="mb-1 text-sm font-bold">
            {value.toFixed(2)}
            {unit && <span className="ml-1 opacity-80">{unit}</span>}
          </div>
          {(chamber || device || level || area || profile || side) && (
            <div className="text-muted-foreground flex flex-col gap-0.5 text-[11px]">
              {chamber && (
                <div>
                  {t.pages.farmOverview.chamberLabel}: {chamber}
                </div>
              )}
              {device && (
                <div>
                  {t.pages.farmOverview.deviceLabel}: {device}
                </div>
              )}
              {level && (
                <div>
                  {t.pages.farmOverview.levelLabel}: {level}
                </div>
              )}
              {area && (
                <div>
                  {t.pages.farmOverview.areaLabel}: {area}
                </div>
              )}
              {profile && (
                <div>
                  {t.pages.farmOverview.profileLabel}: {profile}
                </div>
              )}
              {side && (
                <div>
                  {t.pages.farmOverview.sideLabel}: {side}
                </div>
              )}
            </div>
          )}
          {(measurement || start || stop || time) && (
            <div className="border-border/40 text-muted-foreground/80 mt-1 space-y-0.5 border-t pt-1 text-[11px]">
              {measurement && (
                <div>
                  {t.pages.farmOverview.measurementLabel}: {measurement}
                </div>
              )}
              {time && (
                <div>
                  {t.pages.farmOverview.timeLabel}:{' '}
                  {new Date(time).toLocaleString()}
                </div>
              )}
              {start && (
                <div>
                  {t.pages.farmOverview.startLabel}:{' '}
                  {new Date(start).toLocaleString()}
                </div>
              )}
              {stop && (
                <div>
                  {t.pages.farmOverview.stopLabel}:{' '}
                  {new Date(stop).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
