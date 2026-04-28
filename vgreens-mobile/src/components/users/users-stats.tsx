import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart3, User as UserIcon, Zap } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface UsersStatsProps {
  total: number;
  admins: number;
  members: number;
}

function UsersStatsBase({ total, admins, members }: UsersStatsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: 16,
          marginBottom: 12,
        },
        tile: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        chip: {
          width: 28,
          height: 28,
          borderRadius: 9,
          alignItems: 'center',
          justifyContent: 'center',
        },
        text: { flex: 1, minWidth: 0 },
        value: {
          fontSize: 17,
          fontWeight: '800',
          color: colors.foreground,
          lineHeight: 20,
        },
        label: {
          fontSize: 9,
          fontWeight: '800',
          color: colors.mutedForeground,
          letterSpacing: 0.4,
          marginTop: 1,
        },
      }),
    [colors],
  );

  const ITEMS: {
    key: string;
    value: number;
    label: string;
    Icon: typeof UserIcon;
    accent: string;
  }[] = [
    {
      key: 'total',
      value: total,
      label: 'TOTAL',
      Icon: UserIcon,
      accent: colors.mutedForeground,
    },
    { key: 'members', value: members, label: 'MEMBERS', Icon: Zap, accent: '#10b981' },
    {
      key: 'admins',
      value: admins,
      label: 'ADMINS',
      Icon: BarChart3,
      accent: '#8b5cf6',
    },
  ];

  return (
    <View style={styles.row}>
      {ITEMS.map(({ key, value, label, Icon, accent }) => (
        <View key={key} style={styles.tile}>
          <View style={[styles.chip, { backgroundColor: `${accent}22` }]}>
            <Icon size={16} color={accent} />
          </View>
          <View style={styles.text}>
            <Text
              style={styles.value}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {value}
            </Text>
            <Text
              style={styles.label}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export const UsersStats = memo(UsersStatsBase);
UsersStats.displayName = 'UsersStats';
