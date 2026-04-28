import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AlertStatus } from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { useAppTheme } from '@/lib/theme-preference';

const OPTIONS: { key: 'all' | AlertStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: AlertStatus.Open, label: 'Open' },
  { key: AlertStatus.Acknowledged, label: 'Ack.' },
  { key: AlertStatus.Resolved, label: 'Resolved' },
];

interface AlertStatusFilterProps {
  filter: AlertsFilterInput;
  onChange: (updates: Partial<AlertsFilterInput>) => void;
}

export function AlertStatusFilter({ filter, onChange }: AlertStatusFilterProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 6,
          marginBottom: 12,
          backgroundColor: colors.muted,
          borderRadius: 12,
          padding: 4,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        seg: {
          flex: 1,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          paddingHorizontal: 6,
        },
        segActive: {
          backgroundColor: colors.primary,
        },
        segText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.mutedForeground,
          letterSpacing: 0.2,
        },
        segTextActive: { color: colors.primaryForeground },
      }),
    [colors],
  );

  const active: 'all' | AlertStatus =
    filter.status && !filter.statusIn?.length ? filter.status : 'all';

  return (
    <View style={styles.row}>
      {OPTIONS.map(({ key, label }) => {
        const selected = key === 'all' ? active === 'all' : active === key;
        return (
          <Pressable
            key={String(key)}
            onPress={() =>
              onChange(
                key === 'all'
                  ? { status: undefined, statusIn: undefined }
                  : { status: key, statusIn: undefined },
              )
            }
            style={[styles.seg, selected && styles.segActive]}
          >
            <Text
              style={[styles.segText, selected && styles.segTextActive]}
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
