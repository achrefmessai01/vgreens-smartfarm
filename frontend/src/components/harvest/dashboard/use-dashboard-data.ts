import { useMemo } from 'react';

export interface DashboardData {
  species: string;
  variety: string;
  harvestCount: number;
  totalYield: number;
  averageBrix: number;
  marketablePercent: number;
  wastePercent: number;
  wasteTotal: number;
  criticalAlerts: number;
  daysActive: number;
  yieldOverTime: Array<{date: string; yield: number}>;
  classDistribution: Array<{date: string; marketable: number; waste: number}>;
  brixTrend: Array<{date: string; brix: number}>;
  cumulativeYield: Array<{date: string; cumulative: number; cumulativeWaste: number}>;
}

export function useDashboardData(): DashboardData {
  return useMemo(() => {
    // Generate consecutive daily dates for the last 15 days
    const dates = Array.from({ length: 15 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (14 - i)); // Consecutive daily dates
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    });

    // Generate yield over time data
    const yieldOverTime = dates.map((date, i) => ({
      date,
      yield: Math.round((8 + Math.random() * 8) * 10) / 10, // 8-16 kg range
    }));

    // Generate class distribution data
    const classDistribution = dates.map((date, i) => {
      const total = 12 + Math.random() * 8; // 12-20 kg total
      const wasteRatio = 0.05 + Math.random() * 0.15; // 5-20% waste
      const waste = Math.round(total * wasteRatio * 10) / 10;
      const marketable = Math.round((total - waste) * 10) / 10;
      
      return {
        date,
        marketable,
        waste,
      };
    });

    // Generate Brix trend data
    const brixTrend = dates.map((date, i) => ({
      date,
      brix: Math.round((7.2 + Math.random() * 0.8) * 10) / 10, // 7.2-8.0 range
    }));

    // Generate cumulative yield data with waste
    let cumulative = 0;
    let cumulativeWaste = 0;
    const cumulativeYield: Array<{date: string; cumulative: number; cumulativeWaste: number}> = yieldOverTime.map(({ date, yield: yieldValue }, i) => {
      cumulative += yieldValue;
      cumulativeWaste += classDistribution[i].waste;
      return {
        date,
        cumulative: Math.round(cumulative * 10) / 10,
        cumulativeWaste: Math.round(cumulativeWaste * 10) / 10,
      };
    });

    // Calculate totals
    const totalYield = Math.round(cumulative * 10) / 10;
    const totalMarketable = classDistribution.reduce((sum, item) => sum + item.marketable, 0);
    const totalWaste = classDistribution.reduce((sum, item) => sum + item.waste, 0);
    const marketablePercent = Math.round((totalMarketable / (totalMarketable + totalWaste)) * 1000) / 10;
    const wastePercent = Math.round((totalWaste / (totalMarketable + totalWaste)) * 1000) / 10;
    const averageBrix = Math.round((brixTrend.reduce((sum, item) => sum + item.brix, 0) / brixTrend.length) * 10) / 10;

    return {
      species: 'Erdbeeren',
      variety: 'Elsanta',
      harvestCount: 15,
      totalYield,
      averageBrix,
      marketablePercent,
      wastePercent,
      wasteTotal: Math.round(totalWaste * 10) / 10,
      criticalAlerts: 2,
      daysActive: 53,
      yieldOverTime,
      classDistribution,
      brixTrend,
      cumulativeYield,
    };
  }, []);
}