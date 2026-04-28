import { forwardRef } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary active:opacity-80',
  destructive: 'bg-destructive active:opacity-80',
  outline: 'border border-border bg-transparent active:bg-muted',
  secondary: 'bg-secondary active:opacity-80',
  ghost: 'bg-transparent active:bg-muted',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  default: 'text-primary-foreground',
  destructive: 'text-white',
  outline: 'text-foreground',
  secondary: 'text-secondary-foreground',
  ghost: 'text-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-5 py-3',
  sm: 'h-9 px-3 py-2',
  lg: 'h-14 px-8 py-4',
  icon: 'h-12 w-12 items-center justify-center',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  default: 'text-base',
  sm: 'text-sm',
  lg: 'text-lg',
  icon: 'text-base',
};

export const Button = forwardRef<typeof Pressable, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      label,
      className,
      textClassName,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref as never}
        disabled={disabled}
        className={cn(
          'flex-row items-center justify-center rounded-lg',
          variantStyles[variant],
          sizeStyles[size],
          disabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        {label ? (
          <Text
            className={cn(
              'font-medium',
              variantTextStyles[variant],
              sizeTextStyles[size],
              textClassName,
            )}
          >
            {label}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
