import { memo, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';
import type { UserRole } from '@/types/user';

export type RoleFilter = 'all' | UserRole;

const OPTIONS: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'TENANT_ADMIN', label: 'Tenant Admin' },
  { key: 'TENANT_USER', label: 'Tenant User' },
];

interface UsersRoleFilterProps {
  value: RoleFilter;
  onChange: (v: RoleFilter) => void;
}

function UsersRoleFilterBase({ value, onChange }: UsersRoleFilterProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 16,
          marginBottom: 8,
        },
        chip: {
          flexShrink: 1,
          paddingHorizontal: 12,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        chipActive: {
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.14)',
        },
        text: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.mutedForeground,
          letterSpacing: 0.2,
        },
        textActive: { color: '#10b981' },
      }),
    [colors],
  );

  return (
    <View style={styles.row}>
      {OPTIONS.map(({ key, label }) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.chip, selected && styles.chipActive]}
          >
            <Text
              style={[styles.text, selected && styles.textActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const UsersRoleFilter = memo(UsersRoleFilterBase);
UsersRoleFilter.displayName = 'UsersRoleFilter';
