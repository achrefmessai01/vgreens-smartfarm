import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Ruler } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface BatchSheetStatsProps {
  daysAfterPlanting: number;
  area: number;
}

export function BatchSheetStats({
  daysAfterPlanting,
  area,
}: BatchSheetStatsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingTop: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        text: { fontSize: 13, color: colors.mutedForeground },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Calendar size={14} color={colors.mutedForeground} />
        <Text style={styles.text}>Day {daysAfterPlanting} after planting</Text>
      </View>
      <View style={styles.stat}>
        <Ruler size={14} color={colors.mutedForeground} />
        <Text style={styles.text}>Area: {area} m²</Text>
      </View>
    </View>
  );
}
