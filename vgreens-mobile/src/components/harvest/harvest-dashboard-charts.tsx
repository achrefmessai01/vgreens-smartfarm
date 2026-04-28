import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestAreaChart, HarvestBarChart } from './charts';

interface HarvestDashboardChartsProps {
  data: HarvestDashboardData;
}

export function HarvestDashboardCharts({ data }: HarvestDashboardChartsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionLabel: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginTop: 8,
          marginBottom: 4,
        },
        outlook: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: `${colors.primary}14`,
          borderRadius: 14,
          padding: 12,
          borderWidth: 1,
          borderColor: `${colors.primary}33`,
        },
        outlookBody: { flex: 1 },
        outlookTitle: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.foreground,
        },
        outlookSub: {
          fontSize: 11,
          color: colors.mutedForeground,
          marginTop: 2,
        },
        stack: { gap: 12 },
      }),
    [colors],
  );

  const yieldOverTime = (data.yieldOverTime ?? []).map((p) => ({
    x: p.date,
    y: p.yield,
  }));
  const brixTrend = (data.brixTrend ?? []).map((p) => ({
    x: p.date,
    y: p.brix,
  }));
  const cumulative = (data.cumulativeYield ?? []).map((p) => ({
    x: p.date,
    y: p.cumulative,
  }));

  return (
    <View style={styles.stack}>
      <View style={styles.outlook}>
        <Sparkles size={18} color={colors.primary} />
        <View style={styles.outlookBody}>
          <Text style={styles.outlookTitle}>Yield outlook</Text>
          <Text style={styles.outlookSub}>
            Track trends below to align harvest timing with quality targets.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Yield</Text>
      <HarvestAreaChart
        title="Yield over time"
        subtitle="Daily marketable output"
        points={yieldOverTime}
        unit="kg"
        color="#3b82f6"
        gradientId="grad-yield"
      />
      <HarvestAreaChart
        title="Cumulative yield"
        subtitle="Running total for this period"
        points={cumulative}
        unit="kg"
        color="#10b981"
        gradientId="grad-cumulative"
      />

      <Text style={styles.sectionLabel}>Class distribution</Text>
      <HarvestBarChart
        title="Marketable vs waste"
        subtitle="Stacked by harvest day"
        rows={data.classDistribution ?? []}
      />

      <Text style={styles.sectionLabel}>Quality</Text>
      <HarvestAreaChart
        title="Brix trend"
        subtitle="Average sugar content"
        points={brixTrend}
        unit="°Bx"
        color="#a855f7"
        gradientId="grad-brix"
      />
    </View>
  );
}
