import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestSvgLineChart } from './harvest-svg-chart';
import { HarvestStackedBars } from './harvest-stacked-bars';

interface Props {
  data: HarvestDashboardData;
}

export function HarvestDashboardCharts({ data }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        prediction: {
          backgroundColor: `${colors.primary}22`,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: `${colors.primary}44`,
        },
        predictionTitle: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.primary,
        },
        predictionBody: {
          fontSize: 12,
          color: colors.mutedForeground,
          marginTop: 4,
        },
        gap: { height: 4 },
      }),
    [colors],
  );

  return (
    <>
      <View style={styles.prediction}>
        <Text style={styles.predictionTitle}>Yield outlook</Text>
        <Text style={styles.predictionBody}>
          Track trends below to align harvest timing with quality targets.
        </Text>
      </View>

      <HarvestSvgLineChart
        title="Yield over time"
        points={(data.yieldOverTime ?? []).map((p) => ({
          x: p.date,
          y: p.yield,
        }))}
        yLabel="kg"
        color="#3b82f6"
      />

      <View style={styles.gap} />

      <HarvestStackedBars
        title="Class distribution"
        rows={data.classDistribution ?? []}
      />

      <View style={styles.gap} />

      <HarvestSvgLineChart
        title="Brix trend"
        points={(data.brixTrend ?? []).map((p) => ({
          x: p.date,
          y: p.brix,
        }))}
        yLabel="°Bx"
        color="#a855f7"
      />

      <View style={styles.gap} />

      <HarvestSvgLineChart
        title="Cumulative yield"
        points={(data.cumulativeYield ?? []).map((p) => ({
          x: p.date,
          y: p.cumulative,
        }))}
        yLabel="kg cumulative"
        color="#10b981"
      />
    </>
  );
}
