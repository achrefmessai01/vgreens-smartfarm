import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { AlertTriangle, Package, Sprout } from 'lucide-react-native';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestDateFilter } from './harvest-date-filter';
import { HarvestDashboardMetrics } from './harvest-dashboard-metrics';
import { HarvestDashboardCharts } from './harvest-dashboard-charts';

const FILTER_LABELS: Record<DateFilter, string> = {
  today: 'today',
  thisWeek: 'this week',
  lastWeek: 'last week',
  thisMonth: 'this month',
  lastMonth: 'last month',
  total: 'all time',
};

export function HarvestDashboardTab() {
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<DateFilter>('thisMonth');
  const { data, loading, error, refetch } = useHarvestDashboard(
    filter === 'total' ? undefined : { dateFilter: filter },
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 32, gap: 14 },
        centered: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 8,
          backgroundColor: colors.background,
        },
        hero: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 4,
        },
        heroText: { flex: 1 },
        h1: {
          fontSize: 22,
          fontWeight: '800',
          color: colors.foreground,
          letterSpacing: -0.3,
        },
        sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
        section: { marginTop: 4 },
        muted: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
        err: {
          fontSize: 14,
          color: colors.destructive,
          textAlign: 'center',
          marginTop: 8,
        },
        retry: {
          marginTop: 12,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: colors.primary,
          borderRadius: 10,
        },
        retryText: { color: colors.primaryForeground, fontWeight: '600' },
      }),
    [colors],
  );

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading dashboard…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <AlertTriangle size={28} color={colors.destructive} />
        <Text style={styles.err}>{error.message}</Text>
        <Pressable style={styles.retry} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Package size={28} color={colors.mutedForeground} />
        <Text style={styles.muted}>No harvest data available</Text>
      </View>
    );
  }

  const filterLabel = FILTER_LABELS[filter];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Sprout size={22} color={colors.primary} />
        <View style={styles.heroText}>
          <Text style={styles.h1}>Performance</Text>
          <Text style={styles.sub}>
            {data.harvestCount} harvests logged · {filterLabel}
          </Text>
        </View>
      </View>

      <HarvestDateFilter value={filter} onChange={setFilter} />

      <View style={styles.section}>
        <HarvestDashboardMetrics
          data={data}
          harvestCount={data.harvestCount}
        />
      </View>

      <HarvestDashboardCharts data={data} />
    </ScrollView>
  );
}
