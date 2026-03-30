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
import { useI18n } from '@/i18n';

export interface MonthTableData {
  month: number;
  expectedYield: number;
  expectedBrix: number;
  productionCost: number;
}

interface MonthDataTableProps {
  data: MonthTableData[];
  monthLabel: string;
  expectedYieldLabel: string;
  expectedBrixLabel: string;
  productionCostLabel: string;
  tonsLabel: string;
  brixUnit: string;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function MonthDataTable({
  data,
  monthLabel,
  expectedYieldLabel,
  expectedBrixLabel,
  productionCostLabel,
  tonsLabel,
  brixUnit,
}: MonthDataTableProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {t.pages.yieldSettings.monthDataHighlights}
      </h3>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground hover:bg-primary/90">
              <TableHead className="text-primary-foreground">
                {monthLabel}
              </TableHead>
              <TableHead className="text-primary-foreground">
                {expectedYieldLabel}
              </TableHead>
              <TableHead className="text-primary-foreground">
                {expectedBrixLabel}
              </TableHead>
              <TableHead className="text-primary-foreground">
                {productionCostLabel}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium">
                  {monthNames[row.month - 1]}
                </TableCell>
                <TableCell>
                  {row.expectedYield.toFixed(2)} {tonsLabel}
                </TableCell>
                <TableCell>
                  {row.expectedBrix.toFixed(2)} {brixUnit}
                </TableCell>
                <TableCell>€{row.productionCost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
