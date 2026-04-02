'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import type { ParGraphSectionProps } from '@/types/par-graph';
import { useParGraphData } from '@/lib/hooks/use-par-graph-data';
import { ParGraphHeader } from './par-graph-header';
import { ParGraphChart } from './par-graph-chart';

export function ParGraphSection({
  bay,
  greenhouseId,
  greenhouseLabel,
  embedded = false,
  className,
}: ParGraphSectionProps) {
  void bay;

  const { t } = useI18n();
  const { curveData, currentHour, currentDli, currentPpfd, timeLabel, yMax } =
    useParGraphData(greenhouseId);

  const hasData = curveData.length > 0;
  const content = (
    <>
      <ParGraphHeader
        greenhouseLabel={greenhouseLabel}
        timeLabel={timeLabel}
        currentPpfd={currentPpfd}
        currentDli={currentDli}
      />
      {hasData ? (
        <ParGraphChart
          curveData={curveData}
          currentHour={currentHour}
          currentDli={currentDli}
          yMax={yMax}
        />
      ) : (
        <div className="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-6 text-sm">
          {t.pages.farmOverview.noData}
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div
        className={cn(
          'border-border/50 bg-background flex h-full min-h-[17rem] flex-col overflow-hidden rounded-sm border',
          className,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'min-h-[17rem] gap-0 overflow-hidden rounded-sm py-0',
        className,
      )}
    >
      {content}
    </Card>
  );
}
