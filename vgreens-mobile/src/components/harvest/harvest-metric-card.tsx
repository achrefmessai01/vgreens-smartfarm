import type { ComponentType } from 'react';
import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestProgressRing } from './dashboard/harvest-progress-ring';

interface HarvestMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  accent: string;
  ringValue?: number; // 0..1 if provided shows a mini ring
  ringGradientId?: string;
  style?: StyleProp<ViewStyle>;
}

export function HarvestMetricCard({
  title,
  value,
  unit,
  subtitle,
  Icon,
  accent,
  ringValue,
  ringGradientId,
  style,
}: HarvestMetricCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: 'hidden',
          gap: 8,
        },
        accentBand: {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 3,
          backgroundColor: accent,
        },
        topRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
        },
        iconChip: {
          width: 32,
          height: 32,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${accent}1f`,
        },
        title: {
          fontSize: 10,
          fontWeight: '800',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        },
        valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
        value: {
          fontSize: 24,
          fontWeight: '800',
          color: colors.foreground,
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.5,
        },
        unit: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
        subtitle: {
          fontSize: 11,
          color: colors.mutedForeground,
          marginTop: 'auto',
          lineHeight: 15,
        },
      }),
    [colors, accent],
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.accentBand} />
      <View style={styles.topRow}>
        <View style={styles.iconChip}>
          <Icon size={16} color={accent} />
        </View>
        {ringValue != null && ringGradientId ? (
          <HarvestProgressRing
            value={ringValue}
            size={36}
            strokeWidth={4}
            colorFrom={accent}
            colorTo={accent}
            trackColor={`${colors.mutedForeground}33`}
            gradientId={ringGradientId}
          />
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
  );
}
