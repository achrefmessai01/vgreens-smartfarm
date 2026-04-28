import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Monitor, Moon, Sun } from 'lucide-react-native';
import {
  useAppTheme,
  type ThemePreference,
} from '@/lib/theme-preference';

const OPTIONS: {
  value: ThemePreference;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

export function SettingsAppearance() {
  const { preference, setPreference, colors } = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 6,
          padding: 4,
          borderRadius: 12,
          backgroundColor: colors.muted,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          marginHorizontal: 14,
          marginBottom: 12,
        },
        seg: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          gap: 4,
          borderRadius: 8,
        },
        segActive: {
          backgroundColor: `${colors.primary}1f`,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        label: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.mutedForeground,
        },
        labelActive: { color: colors.primary },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = preference === value;
        const tint = selected ? colors.primary : colors.mutedForeground;
        return (
          <Pressable
            key={value}
            onPress={() => void setPreference(value)}
            style={[styles.seg, selected && styles.segActive]}
          >
            <Icon size={18} color={tint} />
            <Text style={[styles.label, selected && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
