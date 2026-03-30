'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export interface MaintenanceItem {
  title: string;
  due: string;
}

export interface MaintenanceCardProps {
  title?: string;
  items: MaintenanceItem[];
  className?: string;
}

export function MaintenanceCard({
  title,
  items,
  className,
}: MaintenanceCardProps) {
  const { t } = useI18n();

  title = title ?? t.pages.admin.dashboard.maintenanceComponentTitle;
  return (
    <Card className={cn('bg-card rounded-lg border p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item, i) => (
            <li key={i}>
              <div className="font-medium">{item.title}</div>
              <div className="text-muted-foreground text-xs">{item.due}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
