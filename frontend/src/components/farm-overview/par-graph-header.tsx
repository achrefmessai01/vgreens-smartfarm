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
    <div className="border-b border-border/50 bg-muted/15 px-3 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
            {labels.title} - {greenhouseLabel}
          </p>
          <p className="text-[11px] text-muted-foreground">{timeLabel} h</p>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 overflow-hidden rounded-sm border border-border/60 bg-background text-[10px] sm:w-auto">
          <div className="min-w-0 border-r border-border/60 px-2 py-1.5">
            <p className="text-muted-foreground">{labels.currentPpfd}</p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {currentPpfd ?? '--'}
            </p>
            <p className="text-[9px] text-muted-foreground">umol m^-2 s^-1</p>
          </div>
          <div className="min-w-0 px-2 py-1.5">
            <p className="text-muted-foreground">{labels.dli}</p>
            <p className="text-lg font-semibold leading-none tabular-nums">
              {currentDli.toFixed(1)}
            </p>
            <p className="text-[9px] text-muted-foreground">mol m^-2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

