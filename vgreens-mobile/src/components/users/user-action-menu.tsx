import { memo, useMemo, type ComponentType } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Eye, Pencil, Power, PowerOff } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { getUserDisplayName, type User } from '@/types/user';

interface UserActionMenuProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onToggleActive: (u: User) => void;
}

function UserActionMenuBase({
  visible,
  user,
  onClose,
  onView,
  onEdit,
  onToggleActive,
}: UserActionMenuProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          paddingTop: 6,
          paddingBottom: 22,
          paddingHorizontal: 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        grab: {
          alignSelf: 'center',
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.border,
          marginVertical: 10,
        },
        title: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.mutedForeground,
          textAlign: 'center',
          marginBottom: 6,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 14,
          paddingHorizontal: 14,
        },
        icon: {
          width: 34,
          height: 34,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.muted,
        },
        label: { fontSize: 15, color: colors.foreground, fontWeight: '600' },
      }),
    [colors],
  );

  if (!user) return null;
  const isActive = user.isActive;
  const ToggleIcon = isActive ? PowerOff : Power;

  const call = (fn: (u: User) => void) => () => {
    onClose();
    setTimeout(() => fn(user), 40);
  };

  type IconCmp = ComponentType<{ size?: number; color?: string }>;
  const rows: {
    key: string;
    label: string;
    Icon: IconCmp;
    onPress: () => void;
  }[] = [
    { key: 'view', label: 'View details', Icon: Eye, onPress: call(onView) },
    { key: 'edit', label: 'Edit user', Icon: Pencil, onPress: call(onEdit) },
    {
      key: 'toggle',
      label: isActive ? 'Deactivate user' : 'Activate user',
      Icon: ToggleIcon,
      onPress: call(onToggleActive),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grab} />
          <Text style={styles.title} numberOfLines={1}>
            {getUserDisplayName(user)}
          </Text>
          {rows.map(({ key, label, Icon, onPress }) => (
            <Pressable key={key} onPress={onPress} style={styles.row}>
              <View style={styles.icon}>
                <Icon size={16} color={colors.foreground} />
              </View>
              <Text style={styles.label}>{label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const UserActionMenu = memo(UserActionMenuBase);
UserActionMenu.displayName = 'UserActionMenu';
