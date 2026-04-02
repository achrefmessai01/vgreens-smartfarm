import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const colorClasses = {
  default: 'text-foreground',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
} as const;

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'default',
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'transform p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg',
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="space-y-1">
          <h3 className={cn('text-2xl font-bold', colorClasses[color])}>
            {value}
          </h3>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}
