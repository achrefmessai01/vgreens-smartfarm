import { View, Text, Pressable } from 'react-native';
import { Edit2, Trash2 } from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types/user';
import { ROLE_LABELS } from '@/types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  disabled?: boolean;
}

export function UserCard({ user, onEdit, onDelete, disabled }: UserCardProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name';

  const statusVariant =
    user.status === 'ACTIVE'
      ? 'default'
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
    <View className="rounded-lg border border-border bg-card">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-sm font-semibold text-card-foreground">
          {fullName}
        </Text>
        <Badge
          variant="outline"
          label={ROLE_LABELS[user.role] ?? user.role}
        />
      </View>

      <Separator />

      <View className="gap-2 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">Email:</Text>
          <Text className="flex-1 text-xs font-medium text-card-foreground">
            {user.email || '—'}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">Status:</Text>
          <Badge variant={statusVariant} label={statusLabel} />
        </View>
      </View>

      <Separator />

      <View className="flex-row gap-2 px-4 py-2">
        <Pressable
          onPress={() => onEdit(user)}
          disabled={disabled}
          className="rounded-md p-2 active:bg-muted"
        >
          <Edit2 size={16} color="#016f7c" />
        </Pressable>
        <Pressable
          onPress={() => onDelete(user)}
          disabled={disabled}
          className="rounded-md p-2 active:bg-muted"
        >
          <Trash2 size={16} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}
