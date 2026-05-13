'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ParGraphSectionProps } from '@/types/par-graph';
import { useParGraphData } from '@/lib/hooks/use-par-graph-data';
import { ParGraphHeader } from './par-graph-header';
import { ParGraphChart } from './par-graph-chart';

const dli = [
  { hour: 0, value: 0 },
  { hour: 1, value: 0 },
  { hour: 2, value: 0 },
  { hour: 3, value: 0 },
  { hour: 4, value: 0 },
  { hour: 5, value: 0.2 },
  { hour: 6, value: 0.8 },
  { hour: 7, value: 2 },
  { hour: 8, value: 4 },
  { hour: 9, value: 6.5 },
  { hour: 10, value: 9 },
  { hour: 11, value: 11.5 },
  { hour: 12, value: 13.5 },
  { hour: 13, value: 15 },
  { hour: 14, value: 16.2 },
  { hour: 15, value: 17 },
  { hour: 16, value: 17.5 },
  { hour: 17, value: 17.8 },
  { hour: 18, value: 18 },
  { hour: 19, value: 18 },
  { hour: 20, value: 18 },
  { hour: 21, value: 18 },
  { hour: 22, value: 18 },
  { hour: 23, value: 18 },
  { hour: 24, value: 18 },
];

const lowerEdge = [
  { hour: 0, value: 0 },
  { hour: 1, value: 0 },
  { hour: 2, value: 0 },
  { hour: 3, value: 0 },
  { hour: 4, value: 0 },
  { hour: 5, value: 0.1 },
  { hour: 6, value: 0.5 },
  { hour: 7, value: 1.4 },
  { hour: 8, value: 3 },
  { hour: 9, value: 5 },
  { hour: 10, value: 7 },
  { hour: 11, value: 9 },
  { hour: 12, value: 10.8 },
  { hour: 13, value: 12 },
  { hour: 14, value: 13 },
  { hour: 15, value: 13.6 },
  { hour: 16, value: 14 },
  { hour: 17, value: 14.2 },
  { hour: 18, value: 14.4 },
  { hour: 19, value: 14.4 },
  { hour: 20, value: 14.4 },
  { hour: 21, value: 14.4 },
  { hour: 22, value: 14.4 },
  { hour: 23, value: 14.4 },
  { hour: 24, value: 14.4 },
];

const upperEdge = [
  { hour: 0, value: 0 },
  { hour: 1, value: 0 },
  { hour: 2, value: 0 },
  { hour: 3, value: 0 },
  { hour: 4, value: 0 },
  { hour: 5, value: 0.3 },
  { hour: 6, value: 1.1 },
  { hour: 7, value: 2.7 },
  { hour: 8, value: 5 },
  { hour: 9, value: 8 },
  { hour: 10, value: 11 },
  { hour: 11, value: 14 },
  { hour: 12, value: 16.5 },
  { hour: 13, value: 18.5 },
  { hour: 14, value: 20 },
  { hour: 15, value: 21 },
  { hour: 16, value: 21.6 },
  { hour: 17, value: 22 },
  { hour: 18, value: 22.2 },
  { hour: 19, value: 22.2 },
  { hour: 20, value: 22.2 },
  { hour: 21, value: 22.2 },
  { hour: 22, value: 22.2 },
  { hour: 23, value: 22.2 },
  { hour: 24, value: 22.2 },
];

export function ParGraphSection({
  bay,
  greenhouseId,
  greenhouseLabel,
  bucketName,
  embedded = false,
  className,
}: ParGraphSectionProps) {
  void bay;

  const { curveData, currentHour, currentDli, currentPpfd, timeLabel, yMax } =
    useParGraphData(greenhouseId, bucketName);

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
        currentHour={currentHour}
        currentDli={currentDli}
        yMax={yMax}
        dli={dli}
        lowerEdge={lowerEdge}
        upperEdge={upperEdge}
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
