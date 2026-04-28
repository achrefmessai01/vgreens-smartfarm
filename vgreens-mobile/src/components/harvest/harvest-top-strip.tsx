import { memo, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Bell, Settings } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface HarvestTopStripProps {
  title?: string;
  hasNotifications?: boolean;
  onBellPress?: () => void;
  onSettingsPress?: () => void;
}

function formatTodayLabel(): string {
  const d = new Date();
  const weekday = d
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
  const date = d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
  return `${weekday} · ${date}`;
}

function HarvestTopStripBase({
  title = 'Harvest',
  hasNotifications,
  onBellPress,
  onSettingsPress,
}: HarvestTopStripProps) {
  const { colors } = useAppTheme();
  const dateLabel = useMemo(formatTodayLabel, []);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 10,
        },
        left: { flex: 1, minWidth: 0 },
        date: {
          fontSize: 10,
          fontWeight: '800',
          color: colors.mutedForeground,
          letterSpacing: 1,
        },
        title: {
          fontSize: 26,
          fontWeight: '800',
          color: colors.foreground,
          letterSpacing: -0.5,
          marginTop: 2,
        },
        actions: { flexDirection: 'row', gap: 8 },
        iconBtn: {
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.muted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        notifDot: {
          position: 'absolute',
          top: 7,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#ef4444',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.iconBtn}
          onPress={onBellPress}
          accessibilityLabel="Notifications"
        >
          <Bell size={16} color={colors.foreground} />
          {hasNotifications ? <View style={styles.notifDot} /> : null}
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={onSettingsPress}
          accessibilityLabel="Settings"
        >
          <Settings size={16} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

export const HarvestTopStrip = memo(HarvestTopStripBase);
HarvestTopStrip.displayName = 'HarvestTopStrip';
