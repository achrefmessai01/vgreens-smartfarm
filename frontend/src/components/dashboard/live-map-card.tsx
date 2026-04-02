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
    <Card className={cn('bg-card col-span-2 rounded-lg border p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="text-muted-foreground mt-4 flex h-48 items-center justify-center rounded-md bg-gradient-to-br from-slate-800 to-slate-700 text-sm">
          {placeholderText}
        </div>
        {hintText && (
          <p className="text-muted-foreground mt-2 text-xs">{hintText}</p>
        )}
      </CardContent>
    </Card>
  );
}
