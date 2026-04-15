import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface Row {
  date: string;
  marketable: number;
  waste: number;
}

interface HarvestStackedBarsProps {
  title: string;
  rows: Row[];
}

export function HarvestStackedBars({ title, rows }: HarvestStackedBarsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chartTitle: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: 10,
        },
        empty: {
          fontSize: 13,
          color: colors.mutedForeground,
          paddingVertical: 16,
        },
        row: { marginBottom: 8 },
        date: {
          fontSize: 10,
          color: colors.mutedForeground,
          marginBottom: 4,
        },
        barTrack: {
          flexDirection: 'row',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: colors.muted,
        },
        seg: { height: '100%', minWidth: 2 },
        legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
        legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        dot: { width: 8, height: 8, borderRadius: 4 },
        legendText: { fontSize: 11, color: colors.mutedForeground },
      }),
    [colors],
  );

  if (rows.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.empty}>No distribution data</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <Text style={styles.chartTitle}>{title}</Text>
      {rows.slice(-6).map((r) => {
        const total = r.marketable + r.waste || 1;
        const mPct = (r.marketable / total) * 100;
        const wPct = (r.waste / total) * 100;
        return (
          <View key={r.date} style={styles.row}>
            <Text style={styles.date} numberOfLines={1}>
              {r.date}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.seg,
                  { flex: mPct || 0.01, backgroundColor: '#10b981' },
                ]}
              />
              <View
                style={[
                  styles.seg,
                  { flex: wPct || 0.01, backgroundColor: colors.destructive },
                ]}
              />
            </View>
          </View>
        );
      })}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Marketable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
          <Text style={styles.legendText}>Waste</Text>
        </View>
      </View>
    </View>
  );
}
