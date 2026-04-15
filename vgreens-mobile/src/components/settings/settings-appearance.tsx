import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, Monitor, Moon, Sun } from 'lucide-react-native';
import {
  useAppTheme,
  type ThemePreference,
} from '@/lib/theme-preference';

const OPTIONS: {
  value: ThemePreference;
  label: string;
  description: string;
  Icon: typeof Sun;
}[] = [
  {
    value: 'system',
    label: 'System',
    description: 'Match device light/dark mode',
    Icon: Monitor,
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use light appearance',
    Icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use dark appearance',
    Icon: Moon,
  },
];

export function SettingsAppearance() {
  const { preference, setPreference, resolvedScheme, colors } = useAppTheme();

  return (
    <>
      <Text className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Appearance
      </Text>
      <Text className="mb-3 text-xs text-muted-foreground">
        Active now:{' '}
        <Text className="font-semibold text-foreground">
          {resolvedScheme === 'dark' ? 'Dark' : 'Light'}
        </Text>
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {OPTIONS.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => void setPreference(opt.value)}
              style={[
                styles.row,
                { borderBottomColor: colors.border },
                opt.value === 'dark' && styles.rowLast,
              ]}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: colors.muted }]}
              >
                <opt.Icon size={18} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  {opt.label}
                </Text>
                <Text
                  style={[styles.desc, { color: colors.mutedForeground }]}
                >
                  {opt.description}
                </Text>
              </View>
              {selected ? (
                <Check size={20} color={colors.primary} strokeWidth={2.5} />
              ) : (
                <View style={{ width: 20 }} />
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  desc: { fontSize: 12, marginTop: 2 },
});
