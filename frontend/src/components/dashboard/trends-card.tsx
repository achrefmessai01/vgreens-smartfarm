'use client';

import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import { Card, CardContent } from '@/components/ui/card';

export interface TrendItem {
  label: string;
  data: number[];
}

export interface TrendsCardProps {
  title?: string;
  trends: TrendItem[];
  className?: string;
}

export function TrendsCard({
  title,
  trends,
  className,
}: TrendsCardProps) {
  const { t } = useI18n();
  title = title ?? t.pages.tenant.dashboard.trendsTitle;
  return (
    <Card className={cn('bg-card rounded-lg border p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 space-y-3">
          {trends.map((t, i) => (
            <div key={i}>
              <div className="text-muted-foreground text-sm">{t.label}</div>
              <div className="mt-2">
                <Sparkline data={t.data} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
