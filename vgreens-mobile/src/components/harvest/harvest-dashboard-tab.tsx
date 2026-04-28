import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AlertTriangle, Package } from 'lucide-react-native';
import {
  useHarvestDashboard,
  type DateFilter,
} from '@/lib/hooks/use-harvest-dashboard';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestDashboardCharts } from './harvest-dashboard-charts';
import { HarvestDashboardMetrics } from './harvest-dashboard-metrics';
import { HarvestHeroCard } from './dashboard/harvest-hero-card';
import { HarvestPeriodFilter } from './dashboard/harvest-period-filter';
import { createDashboardTabStyles } from './harvest-dashboard-tab.styles';

// Season goal — tunable later per tenant.
const SEASON_GOAL_KG = 2600;

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
      <HarvestHeroCard
        totalYield={data.totalYield ?? 0}
        goal={SEASON_GOAL_KG}
        harvestCount={data.harvestCount}
        daysActive={data.daysActive ?? 0}
        trendPercent={null}
      />

      <HarvestPeriodFilter value={filter} onChange={setFilter} />

      <HarvestDashboardMetrics data={data} />

      <HarvestDashboardCharts data={data} />
    </ScrollView>
  );
}
