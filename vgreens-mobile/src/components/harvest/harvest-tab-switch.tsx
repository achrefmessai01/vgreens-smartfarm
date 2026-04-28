import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BarChart3, ClipboardList } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';

export type HarvestSubTab = 'dashboard' | 'history';

interface HarvestTabSwitchProps {
  value: HarvestSubTab;
  onChange: (tab: HarvestSubTab) => void;
}

export function HarvestTabSwitch({ value, onChange }: HarvestTabSwitchProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        segment: {
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 8,
          marginBottom: 4,
          backgroundColor: colors.muted,
          borderRadius: 12,
          padding: 4,
          gap: 4,
        },
        btn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 10,
          borderRadius: 10,
        },
        active: { backgroundColor: colors.primary },
        text: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.mutedForeground,
        },
        textActive: { color: colors.primaryForeground },
      }),
    [colors],
  );

  const inactiveIcon = colors.mutedForeground;
  const activeIcon = colors.primaryForeground;

  return (
    <View style={styles.segment}>
      <Pressable
        style={[styles.btn, value === 'dashboard' && styles.active]}
        onPress={() => onChange('dashboard')}
      >
        <BarChart3
          size={16}
          color={value === 'dashboard' ? activeIcon : inactiveIcon}
        />
        <Text
          style={[styles.text, value === 'dashboard' && styles.textActive]}
        >
          Dashboard
        </Text>
      </Pressable>
      <Pressable
        style={[styles.btn, value === 'history' && styles.active]}
        onPress={() => onChange('history')}
      >
        <ClipboardList
          size={16}
          color={value === 'history' ? activeIcon : inactiveIcon}
        />
        <Text style={[styles.text, value === 'history' && styles.textActive]}>
          Harvest Entry
        </Text>
      </Pressable>
    </View>
  );
}
