import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { DateFilter } from '@/lib/harvest-date-range';
import { useAppTheme } from '@/lib/theme-preference';

const OPTIONS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'Week' },
  { key: 'thisMonth', label: 'Month' },
  { key: 'total', label: 'Season' },
];

interface HarvestPeriodFilterProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
}

export function HarvestPeriodFilter({
  value,
  onChange,
}: HarvestPeriodFilterProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', gap: 8 },
        seg: {
          flex: 1,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        segActive: {
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.12)',
        },
        text: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.mutedForeground,
          letterSpacing: 0.2,
        },
        textActive: { color: '#10b981' },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {OPTIONS.map(({ key, label }) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.seg, selected && styles.segActive]}
          >
            <Text
              style={[styles.text, selected && styles.textActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
