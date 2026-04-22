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

interface HarvestMetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  accent: string;
  emphasis?: 'default' | 'hero';
  style?: StyleProp<ViewStyle>;
}

export function HarvestMetricCard({
  title,
  value,
  subtitle,
  Icon,
  accent,
  emphasis = 'default',
  style,
}: HarvestMetricCardProps) {
  const { colors } = useAppTheme();
  const hero = emphasis === 'hero';
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingTop: hero ? 18 : 14,
          paddingBottom: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: 'hidden',
          gap: hero ? 10 : 6,
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
          alignItems: 'center',
          gap: 10,
        },
        iconChip: {
          width: hero ? 36 : 30,
          height: hero ? 36 : 30,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${accent}1f`,
        },
        title: {
          flex: 1,
          minWidth: 0,
          fontSize: 10,
          fontWeight: '700',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          lineHeight: 13,
        },
        value: {
          fontSize: hero ? 30 : 24,
          fontWeight: '800',
          color: colors.foreground,
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.5,
        },
        subtitle: {
          fontSize: 11,
          color: colors.mutedForeground,
          lineHeight: 15,
          marginTop: 'auto',
        },
      }),
    [colors, hero, accent],
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.accentBand} />
      <View style={styles.topRow}>
        <View style={styles.iconChip}>
          <Icon size={hero ? 18 : 15} color={accent} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
  );
}
