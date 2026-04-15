import type { ComponentType } from 'react';
import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface HarvestMetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  accent: string;
}

export function HarvestMetricCard({
  title,
  value,
  subtitle,
  Icon,
  accent,
}: HarvestMetricCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 14,
          borderLeftWidth: 3,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        row: { flexDirection: 'row', gap: 12 },
        iconWrap: {
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        },
        textCol: { flex: 1, minWidth: 0 },
        title: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        value: {
          fontSize: 20,
          fontWeight: '800',
          color: colors.foreground,
          marginTop: 2,
          fontVariant: ['tabular-nums'],
        },
        subtitle: {
          fontSize: 11,
          color: colors.mutedForeground,
          marginTop: 2,
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <Icon size={16} color={accent} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}
