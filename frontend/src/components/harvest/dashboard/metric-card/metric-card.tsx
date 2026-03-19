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
    <Card className={cn('p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="space-y-1">
          <h3 className={cn('text-2xl font-bold', colorClasses[color])}>
            {value}
          </h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
}