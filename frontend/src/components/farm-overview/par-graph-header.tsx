'use client'

import { useI18n } from '@/i18n';

export interface ParGraphHeaderProps {
  greenhouseLabel: string;
  timeLabel: string;
  currentPpfd: number | null;
  currentDli: number;
}

export function ParGraphHeader({
  greenhouseLabel,
  timeLabel,
  currentPpfd,
  currentDli,
}: ParGraphHeaderProps) {
  const { t } = useI18n();
  const labels = t.pages.farmOverview.parGraph;

  return (
    <div className="border-b border-border/50 bg-muted/15 px-2 py-1.5 sm:px-3 sm:py-2">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/90 sm:text-xs">
            {labels.title} - {greenhouseLabel}
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-[11px]">{timeLabel} h</p>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 overflow-hidden rounded-sm border border-border/60 bg-background text-[9px] sm:w-auto sm:text-[10px]">
          <div className="min-w-0 border-r border-border/60 px-1.5 py-1 sm:px-2 sm:py-1.5">
            <p className="text-muted-foreground">{labels.currentPpfd}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-semibold leading-none tabular-nums sm:text-lg">
                {currentPpfd ?? '--'}
              </p>
              <p className="hidden text-[9px] text-muted-foreground sm:block">
                umol m^-2 s^-1
              </p>
            </div>
          </div>
          <div className="min-w-0 px-1.5 py-1 sm:px-2 sm:py-1.5">
            <p className="text-muted-foreground">{labels.dli}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-semibold leading-none tabular-nums sm:text-lg">
                {currentDli.toFixed(1)}
              </p>
              <p className="hidden text-[9px] text-muted-foreground sm:block">
                mol m^-2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

