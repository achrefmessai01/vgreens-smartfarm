'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/context';
import { cn } from '@/lib/utils';

export interface LiveMapCardProps {
  title?: string;
  placeholderText?: string;
  hintText?: string;
  className?: string;
}

export function LiveMapCard({
  title,
  placeholderText,
  hintText,
  className,
}: LiveMapCardProps) {
  const { t } = useI18n();

  title = title ?? t.pages.admin.dashboard.liveMapComponentTitle;
  placeholderText =
    placeholderText ?? t.pages.admin.dashboard.liveMapComponentPlaceholder;
  hintText = hintText ?? t.pages.admin.dashboard.liveMapComponentHint;

  return (
    <Card className={cn('col-span-2 rounded-lg border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 h-48 rounded-md bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-sm text-muted-foreground">
          {placeholderText}
        </div>
        {hintText && (
          <p className="text-xs text-muted-foreground mt-2">{hintText}</p>
        )}
      </CardContent>
    </Card>
  );
}
