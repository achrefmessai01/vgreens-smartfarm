import { memo, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

function SettingsSectionBase({ title, children }: SettingsSectionProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 8, marginTop: 8 },
        label: {
          marginHorizontal: 16,
          fontSize: 11,
          fontWeight: '800',
          color: colors.mutedForeground,
          letterSpacing: 0.8,
        },
        card: {
          marginHorizontal: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export const SettingsSection = memo(SettingsSectionBase);
SettingsSection.displayName = 'SettingsSection';
