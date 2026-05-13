'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ParGraphSectionProps } from '@/types/par-graph';
import { useParGraphData } from '@/lib/hooks/use-par-graph-data';
import { ParGraphHeader } from './par-graph-header';
import { ParGraphChart } from './par-graph-chart';

export function ParGraphSection({
  bay,
  greenhouseLabel,
  bucketName,
  embedded = false,
  className,
}: ParGraphSectionProps) {
  void bay;

  const {
    curveData,
    lowerEdge,
    upperEdge,
    currentHour,
    currentDli,
    currentPpfd,
    timeLabel,
    yMax,
  } = useParGraphData(bucketName);

  const content = (
    <>
      <ParGraphHeader
        greenhouseLabel={greenhouseLabel}
        timeLabel={timeLabel}
        currentPpfd={currentPpfd}
        currentDli={currentDli}
      />
      <ParGraphChart
        curveData={curveData}
        lowerEdge={lowerEdge}
        upperEdge={upperEdge}
        currentHour={currentHour}
        currentDli={currentDli}
        yMax={yMax}
      />
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
