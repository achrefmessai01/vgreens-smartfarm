import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      className={cn(
        'h-7 w-12 rounded-full',
        checked ? 'bg-primary' : 'bg-input',
        disabled && 'opacity-50',
        className,
      )}
    >
      <View
        style={{
          transform: [{ translateX: checked ? 20 : 2 }],
        }}
      >
        <View className="mt-0.5 h-6 w-6 rounded-full bg-white shadow" />
      </View>
    </Pressable>
  );
}
