import { useMemo } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import type { DateFilter } from '@/lib/harvest-date-range';
import { useAppTheme } from '@/lib/theme-preference';

const OPTIONS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This week' },
  { key: 'lastWeek', label: 'Last week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'total', label: 'All time' },
];

interface HarvestDateFilterProps {
  value: DateFilter;
  onChange: (f: DateFilter) => void;
}

export function HarvestDateFilter({ value, onChange }: HarvestDateFilterProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: { gap: 8, paddingVertical: 4 },
        chip: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: colors.muted,
          borderWidth: 1,
          borderColor: colors.border,
        },
        chipActive: {
          backgroundColor: `${colors.primary}2a`,
          borderColor: colors.primary,
        },
        chipText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.mutedForeground,
        },
        chipTextActive: { color: colors.foreground },
      }),
    [colors],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {OPTIONS.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
