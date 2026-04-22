import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { AlertTriangle, Leaf, Package, Sprout } from 'lucide-react-native';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestDashboardCharts } from './harvest-dashboard-charts';
import { HarvestDashboardMetrics } from './harvest-dashboard-metrics';
import { HarvestDateFilter } from './harvest-date-filter';
import { createDashboardTabStyles } from './harvest-dashboard-tab.styles';

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
  const styles = useMemo(() => createDashboardTabStyles(colors), [colors]);

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

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Leaf size={22} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.h1}>
            {data.variety || data.species || 'Performance'}
          </Text>
          <Text style={styles.sub}>
            {data.harvestCount} harvests · {FILTER_LABELS[filter]}
          </Text>
        </View>
        <Sprout size={22} color={colors.primary} />
      </View>

      <HarvestDateFilter value={filter} onChange={setFilter} />

      <HarvestDashboardMetrics data={data} harvestCount={data.harvestCount} />

      <HarvestDashboardCharts data={data} />
    </ScrollView>
  );
}
