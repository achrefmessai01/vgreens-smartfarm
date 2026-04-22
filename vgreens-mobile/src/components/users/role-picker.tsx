import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { ROLE_LABELS, getRoleAccent, type UserRole } from '@/types/user';

interface RolePickerProps {
  value?: UserRole;
  onChange: (role: UserRole) => void;
  allowedRoles: UserRole[];
  disabled?: boolean;
}

export function RolePicker({
  value,
  onChange,
  allowedRoles,
  disabled,
}: RolePickerProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 8 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        rowSelected: { borderColor: colors.primary },
        dot: { width: 8, height: 8, borderRadius: 4 },
        label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.foreground },
        labelSelected: { color: colors.primary },
        disabled: { opacity: 0.55 },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      {allowedRoles.map((role) => {
        const selected = value === role;
        const accent = getRoleAccent(role);
        return (
          <Pressable
            key={role}
            onPress={() => onChange(role)}
            disabled={disabled}
            style={[
              styles.row,
              selected && styles.rowSelected,
              disabled && styles.disabled,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {ROLE_LABELS[role]}
            </Text>
            {selected ? <Check size={18} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
