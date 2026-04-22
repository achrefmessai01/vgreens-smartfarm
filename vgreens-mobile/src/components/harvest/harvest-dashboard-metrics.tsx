import { View, StyleSheet } from 'react-native';
import {
  Activity,
  AlertTriangle,
  Package,
  Target,
  TrendingUp,
  Trash2,
} from 'lucide-react-native';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import { HarvestMetricCard } from './harvest-metric-card';

interface Props {
  data: HarvestDashboardData;
  harvestCount: number;
}

export function HarvestDashboardMetrics({ data, harvestCount }: Props) {
  const totalYield = data.totalYield ?? 0;
  const wasteTotal = data.wasteTotal ?? 0;
  const netKg = Math.max(0, totalYield - wasteTotal);
  const avgBrix = data.averageBrix ?? 0;

  return (
    <View style={styles.wrap}>
      <HarvestMetricCard
        title="Total Yield"
        value={`${totalYield.toFixed(1)} kg`}
        subtitle={`${harvestCount} harvests · ${netKg.toFixed(1)} kg net`}
        Icon={TrendingUp}
        accent="#3b82f6"
        emphasis="hero"
      />
      <HarvestMetricCard
        title="Average Brix"
        value={`${avgBrix.toFixed(1)} °Bx`}
        subtitle="Quality indicator across harvests"
        Icon={Target}
        accent="#8b5cf6"
        emphasis="hero"
      />

      <View style={styles.row}>
        <HarvestMetricCard
          style={styles.cell}
          title="Marketable"
          value={`${(data.marketablePercent ?? 0).toFixed(1)}%`}
          subtitle={`${netKg.toFixed(1)} kg net`}
          Icon={Package}
          accent="#10b981"
        />
        <HarvestMetricCard
          style={styles.cell}
          title="Waste"
          value={`${(data.wastePercent ?? 0).toFixed(1)}%`}
          subtitle={`${wasteTotal.toFixed(1)} kg total`}
          Icon={Trash2}
          accent="#ef4444"
        />
      </View>

      <View style={styles.row}>
        <HarvestMetricCard
          style={styles.cell}
          title="Critical Alerts"
          value={data.criticalAlerts ?? 0}
          subtitle="Requires attention"
          Icon={AlertTriangle}
          accent="#f59e0b"
        />
        <HarvestMetricCard
          style={styles.cell}
          title="Days Active"
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
  wrap: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  cell: { flex: 1 },
});
