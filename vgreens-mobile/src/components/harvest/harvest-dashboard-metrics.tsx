import { View, StyleSheet } from 'react-native';
import {
  TrendingUp,
  Target,
  Package,
  Trash2,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import { HarvestMetricCard } from './harvest-metric-card';

interface Props {
  data: HarvestDashboardData;
  harvestCount: number;
}

export function HarvestDashboardMetrics({ data, harvestCount }: Props) {
  const kg = (data.totalYield ?? 0) - (data.wasteTotal ?? 0);
  return (
    <View style={styles.grid}>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Total yield"
          value={`${(data.totalYield ?? 0).toFixed(2)} kg`}
          subtitle={`Across ${harvestCount} harvests`}
          Icon={TrendingUp}
          accent="#3b82f6"
        />
      </View>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Average Brix"
          value={`${(data.averageBrix ?? 0).toFixed(1)}°Bx`}
          subtitle="Quality indicator"
          Icon={Target}
          accent="#8b5cf6"
        />
      </View>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Marketable %"
          value={`${(data.marketablePercent ?? 0).toFixed(1)}%`}
          subtitle={`${kg.toFixed(2)} kg net`}
          Icon={Package}
          accent="#10b981"
        />
      </View>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Waste %"
          value={`${(data.wastePercent ?? 0).toFixed(1)}%`}
          subtitle={`${(data.wasteTotal ?? 0).toFixed(2)} kg`}
          Icon={Trash2}
          accent="#ef4444"
        />
      </View>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Critical alerts"
          value={data.criticalAlerts ?? 0}
          subtitle="Requires attention"
          Icon={AlertTriangle}
          accent="#f59e0b"
        />
      </View>
      <View style={styles.half}>
        <HarvestMetricCard
          title="Days active"
          value={data.daysActive ?? 0}
          subtitle="Since planting window"
          Icon={Activity}
          accent="#06b6d4"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  half: { width: '48%' },
});
