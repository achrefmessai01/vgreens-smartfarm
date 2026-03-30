import type { HistoryTableData } from '@/components/history/history-table';
import type { HistoryChartData } from '@/components/history/history-chart';
import type { ExpenseData } from '@/components/history/expense-donut-chart';
import type { RevenueData } from '@/components/history/revenue-card';

// Generate mock history data
export function generateHistoryData(
  weekCount: number = 12,
): HistoryTableData[] {
  const baseDate = new Date('2025-04-28');
  const data: HistoryTableData[] = [];

  for (let i = 0; i < weekCount; i++) {
    const week = i + 1;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 7);

    // Format date as DD/MM/YYYY
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Generate realistic data with some variance
    const baseYield = 5 + (week / weekCount) * 10;
    const baseBrix = 9.5 + Math.sin((week / weekCount) * Math.PI) * 0.5;
    const baseCost = 5.0 - (week / weekCount) * 0.1;

    // Add variance for actual values
    const yieldVariance = (Math.random() - 0.5) * 0.5;
    const brixVariance = (Math.random() - 0.5) * 0.3;
    const costVariance = (Math.random() - 0.5) * 0.1;

    const expectedYield = baseYield;
    const actualYield = baseYield + yieldVariance;
    const yieldPercentageDiff =
      ((actualYield - expectedYield) / expectedYield) * 100;

    const expectedBrix = baseBrix;
    const actualBrix = baseBrix + brixVariance;
    const brixPercentageDiff =
      ((actualBrix - expectedBrix) / expectedBrix) * 100;

    const expectedProductionCost = baseCost;
    const actualProductionCost = Math.max(4.5, baseCost + costVariance);

    data.push({
      week,
      date: formattedDate,
      expectedYield,
      actualYield,
      yieldPercentageDiff,
      expectedBrix,
      actualBrix,
      brixPercentageDiff,
      expectedProductionCost,
      actualProductionCost,
    });
  }

  return data;
}

// Generate history chart data (for Yield/Brix/Both charts)
export function generateHistoryChartData(
  startWeek: number = 16,
  weekCount: number = 14,
): HistoryChartData[] {
  const data: HistoryChartData[] = [];

  for (let i = 0; i < weekCount; i++) {
    const week = startWeek + i;
    const progress = i / (weekCount - 1);

    // Yield data: peaks around middle, then declines
    const yieldValue = 6 + Math.sin(progress * Math.PI) * 9;

    // Brix data: similar pattern but different scale
    const brixValue = 9.5 + Math.sin(progress * Math.PI) * 1.5;

    data.push({
      week,
      yield: yieldValue,
      brix: brixValue,
    });
  }

  return data;
}

// Generate expense breakdown data for donut chart
export function generateExpenseData(): ExpenseData[] {
  return [
    {
      name: 'Labor',
      value: 4400,
      percentage: 38,
      color: '#016F7C',
    },
    {
      name: 'Energy',
      value: 2000,
      percentage: 22,
      color: '#0EA97C',
    },
    {
      name: 'Water',
      value: 1800,
      percentage: 18,
      color: '#0DBA97',
    },
    {
      name: 'Consumables',
      value: 1200,
      percentage: 12,
      color: '#0ECA97',
    },
    {
      name: 'Licenses',
      value: 1000,
      percentage: 10,
      color: '#0EDA97',
    },
  ];
}

// Generate revenue data
export function generateRevenueData(): RevenueData {
  return {
    water: 1800,
    energy: 2000,
    consumables: 1800,
    labor: 4400,
  };
}

// Generate OPEX data (reuse from existing)
export function generateOpexData() {
  return {
    water: 1800,
    energy: 2000,
    consumables: 1300,
    labor: 4400,
  };
}
