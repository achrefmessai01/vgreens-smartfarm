import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  outline: 'border border-border bg-transparent',
  success: 'bg-emerald-500',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  destructive: 'text-white',
  outline: 'text-foreground',
  success: 'text-white',
};

export function Badge({
  variant = 'default',
  label,
  className,
  textClassName,
}: BadgeProps) {
  return (
    <View
      className={cn(
        'rounded-full px-2.5 py-0.5',
        variantStyles[variant],
        className,
      )}
    >
      <Text
        className={cn(
          'text-xs font-medium',
          variantTextStyles[variant],
          textClassName,
        )}
      >
        {label}
      </Text>
    </View>
  );
}
