'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type HistoryViewType = 'yield' | 'brix' | 'both';

export interface HistoryTableData {
  week: number;
  date: string;
  expectedYield?: number;
  actualYield?: number;
  yieldPercentageDiff?: number;
  expectedBrix?: number;
  actualBrix?: number;
  brixPercentageDiff?: number;
  expectedProductionCost: number;
  actualProductionCost: number;
}

interface HistoryTableProps {
  data: HistoryTableData[];
  viewType: HistoryViewType;
  weekLabel: string;
  dateLabel: string;
  expectedYieldLabel: string;
  actualYieldLabel: string;
  expectedBrixLabel: string;
  actualBrixLabel: string;
  expectedProductionCostLabel: string;
  actualProductionCostLabel: string;
  tonsLabel: string;
  brixUnit: string;
}

export function HistoryTable({
  data,
  viewType,
  weekLabel,
  dateLabel,
  expectedYieldLabel,
  actualYieldLabel,
  expectedBrixLabel,
  actualBrixLabel,
  expectedProductionCostLabel,
  actualProductionCostLabel,
  tonsLabel,
  brixUnit,
}: HistoryTableProps) {
  const showYield = viewType === 'yield' || viewType === 'both';
  const showBrix = viewType === 'brix' || viewType === 'both';

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 0) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground hover:bg-primary/90">
              <TableHead className="text-primary-foreground">
                {weekLabel}
              </TableHead>
              <TableHead className="text-primary-foreground">
                {dateLabel}
              </TableHead>
              {showYield && (
                <>
                  <TableHead className="text-primary-foreground">
                    {expectedYieldLabel}
                  </TableHead>
                  <TableHead className="text-primary-foreground">
                    {actualYieldLabel}
                  </TableHead>
                </>
              )}
              {showBrix && (
                <>
                  <TableHead className="text-primary-foreground">
                    {expectedBrixLabel}
                  </TableHead>
                  <TableHead className="text-primary-foreground">
                    {actualBrixLabel}
                  </TableHead>
                </>
              )}
              <TableHead className="text-primary-foreground">
                {expectedProductionCostLabel}
              </TableHead>
              <TableHead className="text-primary-foreground">
                {actualProductionCostLabel}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.week}>
                <TableCell className="font-medium">{row.week}</TableCell>
                <TableCell>{row.date}</TableCell>
                {showYield && (
                  <>
                    <TableCell>
                      {row.expectedYield?.toFixed(2)} {tonsLabel}
                    </TableCell>
                    <TableCell>
                      {row.actualYield?.toFixed(2)} {tonsLabel}
                      {row.yieldPercentageDiff !== undefined && (
                        <span
                          className={cn(
                            'ml-2 text-sm',
                            getPercentageColor(row.yieldPercentageDiff),
                          )}
                        >
                          ({formatPercentage(row.yieldPercentageDiff)})
                        </span>
                      )}
                    </TableCell>
                  </>
                )}
                {showBrix && (
                  <>
                    <TableCell>
                      {row.expectedBrix?.toFixed(2)} {brixUnit}
                    </TableCell>
                    <TableCell>
                      {row.actualBrix?.toFixed(2)} {brixUnit}
                      {row.brixPercentageDiff !== undefined && (
                        <span
                          className={cn(
                            'ml-2 text-sm',
                            getPercentageColor(row.brixPercentageDiff),
                          )}
                        >
                          ({formatPercentage(row.brixPercentageDiff)})
                        </span>
                      )}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  €{row.expectedProductionCost.toFixed(2)}/kg
                </TableCell>
                <TableCell>€{row.actualProductionCost.toFixed(2)}/kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
