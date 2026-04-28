import { View, Text, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends ViewProps {
  className?: string;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <View className={cn('gap-1.5 pb-3', className)} {...props} />;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <Text className={cn('text-lg font-semibold text-card-foreground', className)}>
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <Text className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Text>
  );
}

interface CardContentProps extends ViewProps {
  className?: string;
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <View className={cn('', className)} {...props} />;
}

interface CardFooterProps extends ViewProps {
  className?: string;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <View
      className={cn('flex-row items-center pt-3', className)}
      {...props}
    />
  );
}
