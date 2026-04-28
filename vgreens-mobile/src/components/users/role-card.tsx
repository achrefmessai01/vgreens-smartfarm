import { memo, useMemo, type ComponentType } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check, Shield, User as UserIcon } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { getRoleAccent, ROLE_LABELS, type UserRole } from '@/types/user';

interface RoleCardProps {
  role: UserRole;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (role: UserRole) => void;
}

const ICONS: Record<UserRole, ComponentType<{ size?: number; color?: string }>> = {
  TENANT_ADMIN: Shield,
  TENANT_USER: UserIcon,
  VGREENS_ADMIN: Shield,
};

function RoleCardBase({
  role,
  description,
  selected,
  disabled,
  onSelect,
}: RoleCardProps) {
  const { colors } = useAppTheme();
  const accent = getRoleAccent(role);
  const Icon = ICONS[role];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          padding: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
        selected: {
          borderColor: accent,
          borderWidth: 2,
          backgroundColor: `${accent}0d`,
        },
        disabled: { opacity: 0.55 },
        iconChip: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${accent}1f`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        body: { flex: 1, gap: 2 },
        title: { fontSize: 15, fontWeight: '700', color: colors.foreground },
        desc: {
          fontSize: 12,
          color: colors.mutedForeground,
          lineHeight: 17,
        },
        checkChip: {
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        },
        checkActive: { backgroundColor: accent, borderColor: accent },
        checkInactive: { borderColor: colors.border, backgroundColor: 'transparent' },
      }),
    [colors, accent],
  );

  return (
    <Pressable
      onPress={() => onSelect(role)}
      disabled={disabled}
      style={[
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.iconChip}>
        <Icon size={18} color={accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{ROLE_LABELS[role]}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <View
        style={[
          styles.checkChip,
          selected ? styles.checkActive : styles.checkInactive,
        ]}
      >
        {selected ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

export const RoleCard = memo(RoleCardBase);
RoleCard.displayName = 'RoleCard';
