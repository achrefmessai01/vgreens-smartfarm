import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, Home, Scale, Trash2, Pencil } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { formatHarvestDate, getGreenhouseLabel } from '@/lib/harvest-utils';
import { useAppTheme } from '@/lib/theme-preference';

interface HarvestItemCardProps {
  harvest: HarvestItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function HarvestItemCard({
  harvest,
  onEdit,
  onDelete,
}: HarvestItemCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginBottom: 12,
        },
        top: { marginBottom: 10 },
        dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        date: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
        batch: {
          fontSize: 16,
          fontWeight: '800',
          color: colors.foreground,
          marginTop: 4,
        },
        stats: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 8,
        },
        stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        statVal: { fontSize: 13, fontWeight: '600', color: colors.foreground },
        classA: { color: '#10b981' },
        wasteLabel: { fontSize: 11, color: colors.mutedForeground },
        wasteVal: { fontSize: 13, fontWeight: '600', color: '#f87171' },
        brix: { fontSize: 13, fontWeight: '700', color: '#a78bfa' },
        author: { fontSize: 11, color: colors.mutedForeground },
        actions: {
          flexDirection: 'row',
          marginTop: 12,
          gap: 10,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingTop: 12,
        },
        btn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: colors.muted,
        },
        btnEdit: { fontSize: 13, fontWeight: '600', color: colors.primary },
        btnDel: { fontSize: 13, fontWeight: '600', color: colors.destructive },
      }),
    [colors],
  );

  const author = harvest.createdBy
    ? [harvest.createdBy.firstName, harvest.createdBy.lastName]
        .filter(Boolean)
        .join(' ') || harvest.createdBy.email
    : '—';

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.dateRow}>
          <Calendar size={14} color={colors.primary} />
          <Text style={styles.date}>{formatHarvestDate(harvest.date)}</Text>
        </View>
        <Text style={styles.batch} numberOfLines={1}>
          {harvest.batch}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Home size={12} color={colors.mutedForeground} />
          <Text style={styles.statVal}>{getGreenhouseLabel(harvest.greenhouse)}</Text>
        </View>
        <View style={styles.stat}>
          <Scale size={12} color="#10b981" />
          <Text style={[styles.statVal, styles.classA]}>{harvest.classA} kg</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.wasteLabel}>Waste</Text>
          <Text style={styles.wasteVal}>{harvest.waste} kg</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.brix}>{harvest.avgBrix}°Bx</Text>
        </View>
      </View>

      <Text style={styles.author}>Logged by {author}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={onEdit}>
          <Pencil size={16} color={colors.primary} />
          <Text style={styles.btnEdit}>Edit</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={onDelete}>
          <Trash2 size={16} color={colors.destructive} />
          <Text style={styles.btnDel}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
