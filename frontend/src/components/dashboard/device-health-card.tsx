'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n/context';
import { cn } from '@/lib/utils';

export interface DeviceStatusItem {
  name: string;
  detail: string;
  status: 'online' | 'degraded' | 'offline';
}

export interface WeatherInfo {
  icon?: string;
  label: string;
  detail?: string;
}

export interface DeviceHealthCardProps {
  title?: string;
  devices: DeviceStatusItem[];
  weather?: WeatherInfo;
  className?: string;
}

const statusClass: Record<DeviceStatusItem['status'], string> = {
  online: 'text-emerald-500',
  degraded: 'text-amber-500',
  offline: 'text-red-500',
};

export function DeviceHealthCard({
  title,
  devices,
  weather,
  className,
}: DeviceHealthCardProps) {
  const { t } = useI18n();

  title = title ?? t.pages.admin.dashboard.deviceHealthAndWeatherComponentTitle;

  return (
    <Card className={cn('bg-card rounded-lg border p-6', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <CardContent className="p-0">
        <div className="mt-4 space-y-3 text-sm">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-muted-foreground text-xs">{d.detail}</div>
              </div>
              <div
                className={cn('text-sm font-semibold', statusClass[d.status])}
              >
                {d.status === 'online'
                  ? 'Online'
                  : d.status === 'degraded'
                    ? 'Degraded'
                    : 'Offline'}
              </div>
            </div>
          ))}
        </div>
        {weather && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-muted-foreground text-sm">Weather</h4>
            <div className="mt-2 flex items-center gap-3">
              {weather.icon && <div className="text-3xl">{weather.icon}</div>}
              <div>
                <div className="font-semibold">{weather.label}</div>
                {weather.detail && (
                  <div className="text-muted-foreground text-sm">
                    {weather.detail}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
