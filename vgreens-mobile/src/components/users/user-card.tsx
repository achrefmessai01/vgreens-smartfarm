import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import {
  ROLE_LABELS,
  getRoleAccent,
  getStatusPalette,
  getUserDisplayName,
  getUserInitials,
  type User,
} from '@/types/user';
import { createUserCardStyles } from './user-card.styles';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  disabled?: boolean;
}

function UserCardBase({ user, onEdit, onDelete, disabled }: UserCardProps) {
  const { colors } = useAppTheme();
  const accent = getRoleAccent(user.role);
  const stat = getStatusPalette(user.status, user.isActive);
  const styles = useMemo(
    () => createUserCardStyles(colors, accent),
    [colors, accent],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>
              {getUserInitials(user.firstName, user.lastName, user.email)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {getUserDisplayName(user)}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user.email || '—'}
            </Text>
          </View>
          <View style={styles.pillsCol}>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {(ROLE_LABELS[user.role] ?? user.role).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: stat.bg }]}>
              <Text style={[styles.statusPillText, { color: stat.color }]}>
                {stat.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onEdit(user)}
            disabled={disabled}
            style={[styles.btn, styles.btnEdit]}
          >
            <Pencil size={14} color={colors.foreground} />
            <Text style={styles.btnEditText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(user)}
            disabled={disabled}
            style={[styles.btn, styles.btnDel]}
          >
            <Trash2 size={14} color="#fff" />
            <Text style={styles.btnDelText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const UserCard = memo(UserCardBase);
UserCard.displayName = 'UserCard';
