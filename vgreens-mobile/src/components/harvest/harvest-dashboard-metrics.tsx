import { View, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  Package,
  Target,
  Trash2,
} from 'lucide-react-native';
import type { HarvestDashboardData } from '@/lib/hooks/use-harvest-dashboard';
import { HarvestMetricCard } from './harvest-metric-card';

interface Props {
  data: HarvestDashboardData;
}

export function HarvestDashboardMetrics({ data }: Props) {
  const marketablePct = data.marketablePercent ?? 0;
  const wastePct = data.wastePercent ?? 0;
  const netKg = Math.max(
    0,
    (data.totalYield ?? 0) - (data.wasteTotal ?? 0),
  );
  const avgBrix = data.averageBrix ?? 0;
  const brixOutOfTen = Math.min(10, avgBrix); // treat brix as a /10 quality index
  const criticalAlerts = data.criticalAlerts ?? 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <HarvestMetricCard
          style={styles.cell}
          title="Marketable"
          value={marketablePct.toFixed(1)}
          unit="%"
          subtitle={`${netKg.toFixed(0)} kg net`}
          Icon={Package}
          accent="#10b981"
          ringValue={marketablePct / 100}
          ringGradientId="grad-marketable"
        />
        <HarvestMetricCard
          style={styles.cell}
          title="Waste"
          value={wastePct.toFixed(1)}
          unit="%"
          subtitle={`${(data.wasteTotal ?? 0).toFixed(0)} kg total`}
          Icon={Trash2}
          accent="#ef4444"
          ringValue={Math.min(1, wastePct / 25)}
          ringGradientId="grad-waste"
        />
      </View>
      <View style={styles.row}>
        <HarvestMetricCard
          style={styles.cell}
          title="Quality index"
          value={avgBrix.toFixed(1)}
          unit="/10"
          subtitle="Grade A avg"
          Icon={Target}
          accent="#8b5cf6"
          ringValue={brixOutOfTen / 10}
          ringGradientId="grad-quality"
        />
        <HarvestMetricCard
          style={styles.cell}
          title="Critical"
          value={criticalAlerts}
          subtitle="Requires attention"
          Icon={AlertTriangle}
          accent="#f59e0b"
          ringValue={Math.min(1, criticalAlerts / 10)}
          ringGradientId="grad-critical"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  cell: { flex: 1 },
});
