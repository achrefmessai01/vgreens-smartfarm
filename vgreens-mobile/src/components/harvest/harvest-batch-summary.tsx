import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { useAppTheme } from '@/lib/theme-preference';
import { createBatchGroupStyles } from './harvest-batch-group.styles';

interface BatchTotals {
  classA: number;
  waste: number;
  marketable: number;
}

interface HarvestBatchSummaryProps {
  batch: HarvestItem;
  open: boolean;
  onToggleOpen: () => void;
  onToggleMenu: () => void;
  totals: BatchTotals;
  days: number;
}

export function HarvestBatchSummary({
  batch,
  open,
  onToggleOpen,
  onToggleMenu,
  totals,
  days,
}: HarvestBatchSummaryProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchGroupStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Pressable style={styles.titleRow} onPress={onToggleOpen}>
        <View style={styles.chevronBtn}>
          {open ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {batch.batch}
        </Text>
        <Pressable
          style={styles.menuBtn}
          hitSlop={8}
          onPress={onToggleMenu}
          accessibilityLabel="Toggle batch actions"
        >
          <MoreVertical size={18} color={colors.mutedForeground} />
        </Pressable>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>CLASS A</Text>
          <Text style={[styles.statValue, { color: '#10b981' }]}>
            {totals.classA} kg
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>WASTE</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {totals.waste} kg
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DAY</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {days}d
          </Text>
        </View>
      </View>

      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{totals.marketable}% marketable</Text>
        <Text style={styles.barArea}>{batch.cultivationArea ?? 0} m²</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${totals.marketable}%` }]} />
      </View>
    </View>
  );
}
