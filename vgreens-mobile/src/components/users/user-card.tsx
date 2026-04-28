import { memo, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { BadgeCheck, MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme-preference';
import { formatRelativeTime } from '@/lib/format-relative-time';
import {
  ROLE_LABELS,
  getRoleAccent,
  getUserDisplayName,
  getUserInitials,
  type User,
} from '@/types/user';
import { UserAvatar } from './user-avatar';
import { REVEAL_WIDTH, createUserCardStyles } from './user-card.styles';

interface UserCardProps {
  user: User;
  revealed: boolean;
  onToggleReveal: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserCardBase({
  user,
  revealed,
  onToggleReveal,
  onEdit,
  onDelete,
}: UserCardProps) {
  const { colors } = useAppTheme();
  const accent = getRoleAccent(user.role);
  const styles = useMemo(
    () => createUserCardStyles(colors, accent),
    [colors, accent],
  );

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: revealed ? -REVEAL_WIDTH : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, translateX]);

  const since = user.updatedAt ?? user.createdAt ?? null;

  return (
    <View style={styles.outer}>
      <View style={styles.actionsStrip}>
        <Pressable
          style={[styles.actionBtn, styles.actionEdit]}
          onPress={() => onEdit(user)}
          accessibilityLabel="Edit user"
        >
          <Pencil size={20} color="#10b981" />
          <Text style={styles.actionEditText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionDelete]}
          onPress={() => onDelete(user)}
          accessibilityLabel="Delete user"
        >
          <Trash2 size={20} color="#ef4444" />
          <Text style={styles.actionDeleteText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.cardWrap, { transform: [{ translateX }] }]}
      >
        <View style={styles.card}>
          <UserAvatar
            role={user.role}
            initials={getUserInitials(
              user.firstName,
              user.lastName,
              user.email,
            )}
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {getUserDisplayName(user)}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user.email || '—'}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.rolePill}>
                <BadgeCheck size={10} color={accent} />
                <Text style={styles.rolePillText}>
                  {(ROLE_LABELS[user.role] ?? user.role).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.time}>· {formatRelativeTime(since)}</Text>
              {!user.isActive ? (
                <View style={styles.inactiveTag}>
                  <Text style={styles.inactiveText}>INACTIVE</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={() => onToggleReveal(user)}
            style={styles.menuBtn}
            hitSlop={8}
            accessibilityLabel="Toggle actions"
          >
            <MoreVertical size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

export const UserCard = memo(UserCardBase);
UserCard.displayName = 'UserCard';
