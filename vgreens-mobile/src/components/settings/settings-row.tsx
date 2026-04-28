import { memo, useMemo, type ComponentType, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface SettingsRowProps {
  Icon: ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  showChevron?: boolean;
}

function SettingsRowBase({
  Icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  isLast,
  showChevron = true,
}: SettingsRowProps) {
  const { colors } = useAppTheme();
  const resolvedIcon = iconColor ?? colors.primary;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        iconChip: {
          width: 34,
          height: 34,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${resolvedIcon}1f`,
        },
        textCol: { flex: 1, minWidth: 0 },
        title: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.foreground,
        },
        subtitle: {
          fontSize: 12,
          color: colors.mutedForeground,
          marginTop: 2,
        },
        rightCol: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        },
      }),
    [colors, isLast, resolvedIcon],
  );

  const body = (
    <>
      <View style={styles.iconChip}>
        <Icon size={16} color={resolvedIcon} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightCol}>
        {right}
        {showChevron && onPress ? (
          <ChevronRight size={16} color={colors.mutedForeground} />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.row}>
        {body}
      </Pressable>
    );
  }
  return <View style={styles.row}>{body}</View>;
}

export const SettingsRow = memo(SettingsRowBase);
SettingsRow.displayName = 'SettingsRow';
