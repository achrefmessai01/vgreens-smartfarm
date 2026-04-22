import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HarvestStatus } from '@/generated/graphql';
import { useAppTheme } from '@/lib/theme-preference';

interface BatchSheetHeaderProps {
  name: string;
  species: string;
  variety: string;
  status: HarvestStatus;
}

const STATUS_LABEL: Record<HarvestStatus, string> = {
  [HarvestStatus.Draft]: 'Draft',
  [HarvestStatus.Active]: 'Active',
  [HarvestStatus.Completed]: 'Completed',
  [HarvestStatus.Inactive]: 'Inactive',
};

const STATUS_BG: Record<HarvestStatus, string> = {
  [HarvestStatus.Draft]: '#f59e0b',
  [HarvestStatus.Active]: '#10b981',
  [HarvestStatus.Completed]: '#3b82f6',
  [HarvestStatus.Inactive]: '#6b7280',
};

export function BatchSheetHeader({
  name,
  species,
  variety,
  status,
}: BatchSheetHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 8 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        },
        name: {
          flex: 1,
          fontSize: 18,
          fontWeight: '700',
          color: colors.foreground,
        },
        badge: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        },
        badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
        meta: { fontSize: 13, color: colors.mutedForeground },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUS_BG[status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABEL[status]} Batch</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {species} • {variety}
      </Text>
    </View>
  );
}
