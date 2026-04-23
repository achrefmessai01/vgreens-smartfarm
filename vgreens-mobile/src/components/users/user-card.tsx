import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BadgeCheck, MoreVertical } from 'lucide-react-native';
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
import { createUserCardStyles } from './user-card.styles';

interface UserCardProps {
  user: User;
  onMenuPress: (user: User) => void;
}

function UserCardBase({ user, onMenuPress }: UserCardProps) {
  const { colors } = useAppTheme();
  const accent = getRoleAccent(user.role);
  const styles = useMemo(
    () => createUserCardStyles(colors, accent),
    [colors, accent],
  );

  const since = user.updatedAt ?? user.createdAt ?? null;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <UserAvatar
          role={user.role}
          initials={getUserInitials(user.firstName, user.lastName, user.email)}
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
          onPress={() => onMenuPress(user)}
          style={styles.menuBtn}
          hitSlop={8}
          accessibilityLabel="User actions"
        >
          <MoreVertical size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

export const UserCard = memo(UserCardBase);
UserCard.displayName = 'UserCard';
