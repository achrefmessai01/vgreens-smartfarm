import { View, Text, Pressable } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types/user';
import { ROLE_LABELS } from '@/types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  disabled?: boolean;
}

function getInitials(firstName?: string, lastName?: string, email?: string) {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) return firstName[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

export function UserCard({ user, onEdit, onDelete, disabled }: UserCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name';
  const initials = getInitials(user.firstName, user.lastName, user.email);

  const statusVariant =
    user.status === 'ACTIVE' || user.isActive
      ? 'success'
      : user.status === 'PENDING'
        ? 'outline'
        : 'secondary';

  const statusLabel =
    user.status === 'PENDING'
      ? 'Pending'
      : user.isActive
        ? 'Active'
        : 'Inactive';

  return (
    <View className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm">
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
          <Text className="text-sm font-bold text-white">{initials}</Text>
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-semibold text-card-foreground">
            {fullName}
          </Text>
          <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
            {user.email || '—'}
          </Text>
        </View>

        <View className="items-end gap-1.5">
          <Badge
            variant="outline"
            label={ROLE_LABELS[user.role] ?? user.role}
            className="border-primary/30 bg-primary/5"
            textClassName="text-primary"
          />
          <Badge variant={statusVariant} label={statusLabel} />
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-end gap-2">
        <Pressable
          onPress={() => onEdit(user)}
          disabled={disabled}
          className="flex-row items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 active:bg-muted"
        >
          <Pencil size={13} color="#016f7c" />
          <Text className="text-xs font-medium text-primary">Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(user)}
          disabled={disabled}
          className="flex-row items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 active:bg-muted"
        >
          <Trash2 size={13} color="#ef4444" />
          <Text className="text-xs font-medium text-destructive">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
