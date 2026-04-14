import { View, Text, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import type { UserRole } from '@/types/user';
import { ROLE_LABELS } from '@/types/user';
import { cn } from '@/lib/utils';

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
  return (
    <View className="gap-2">
      {allowedRoles.map((role) => {
        const selected = value === role;
        return (
          <Pressable
            key={role}
            onPress={() => onChange(role)}
            disabled={disabled}
            className={cn(
              'flex-row items-center justify-between rounded-lg border px-4 py-3',
              selected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-background',
              disabled && 'opacity-50',
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                selected ? 'text-primary' : 'text-foreground',
              )}
            >
              {ROLE_LABELS[role]}
            </Text>
            {selected ? <Check size={18} color="#016f7c" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
