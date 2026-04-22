import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, Eye, Trash2 } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { formatHarvestDate } from '@/lib/harvest-utils';
import { getCreatedByLabel } from '@/lib/harvest-grouping';
import { useAppTheme } from '@/lib/theme-preference';

interface HarvestEntryCardProps {
  entry: HarvestItem;
  onView: () => void;
  onDelete: () => void;
}

export function HarvestEntryCard({
  entry,
  onView,
  onDelete,
}: HarvestEntryCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 10,
        },
        dateCol: { flex: 1, minWidth: 0 },
        uLabel: {
          fontSize: 10,
          fontWeight: '700',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
        dateText: { fontSize: 14, fontWeight: '700', color: colors.foreground },
        brixChip: {
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: colors.muted,
          alignItems: 'flex-end',
        },
        brixValue: { fontSize: 14, fontWeight: '700', color: colors.foreground },
        grid: { flexDirection: 'row', gap: 10 },
        stat: {
          flex: 1,
          backgroundColor: colors.muted,
          borderRadius: 10,
          padding: 10,
        },
        statVal: { fontSize: 16, fontWeight: '700' },
        statValGood: { color: '#10b981' },
        statValBad: { color: '#ef4444' },
        footer: {
          marginTop: 12,
          paddingTop: 10,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          gap: 10,
        },
        author: { fontSize: 11, color: colors.mutedForeground },
        actions: { flexDirection: 'row', gap: 8 },
        btn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 9,
          borderRadius: 10,
        },
        btnView: {
          backgroundColor: colors.muted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        btnDel: { backgroundColor: '#b91c1c' },
        btnText: { fontSize: 13, fontWeight: '600' },
        btnViewText: { color: colors.foreground },
        btnDelText: { color: '#fff' },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.dateCol}>
          <Text style={styles.uLabel}>Date</Text>
          <View style={styles.dateRow}>
            <Calendar size={14} color={colors.primary} />
            <Text style={styles.dateText}>{formatHarvestDate(entry.date)}</Text>
          </View>
        </View>
        <View style={styles.brixChip}>
          <Text style={styles.uLabel}>Avg Brix</Text>
          <Text style={styles.brixValue}>{entry.avgBrix}°Bx</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.stat}>
          <Text style={styles.uLabel}>Class A</Text>
          <Text style={[styles.statVal, styles.statValGood]}>
            {entry.classA} kg
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.uLabel}>Waste</Text>
          <Text style={[styles.statVal, styles.statValBad]}>
            {entry.waste} kg
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.uLabel}>Created by</Text>
          <Text style={styles.author} numberOfLines={1}>
            {getCreatedByLabel(entry)}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnView]} onPress={onView}>
            <Eye size={15} color={colors.foreground} />
            <Text style={[styles.btnText, styles.btnViewText]}>
              View details
            </Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnDel]} onPress={onDelete}>
            <Trash2 size={15} color="#fff" />
            <Text style={[styles.btnText, styles.btnDelText]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
