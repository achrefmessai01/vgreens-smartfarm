import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
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
  const offset = useSharedValue(checked ? 20 : 2);

  useEffect(() => {
    offset.value = withTiming(checked ? 20 : 2, { duration: 200 });
  }, [checked, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

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
      <Animated.View style={thumbStyle}>
        <View className="mt-0.5 h-6 w-6 rounded-full bg-white shadow" />
      </Animated.View>
    </Pressable>
  );
}
