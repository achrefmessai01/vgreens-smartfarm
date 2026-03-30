'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SensorGauge } from './sensor-gauge';
import { AlertTriangle, Bell, Thermometer, Droplets } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { Tunnel, TunnelStatus } from '@/types/tunnel.types';
import { cn } from '@/lib/utils';

interface TunnelCardProps {
  tunnel: Tunnel;
}

export function TunnelCard({ tunnel }: TunnelCardProps) {
  const { t } = useI18n();

  const getStatusBadge = (status: TunnelStatus) => {
    const statusConfig = {
      normal: {
        label: t.pages.farmOverview.normal,
        variant: 'outline' as const,
        className: 'border-green-500/50 text-green-700 dark:text-green-400',
      },
      warning: {
        label: t.pages.farmOverview.warning,
        variant: 'secondary' as const,
        className: 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400',
      },
      critical: {
        label: t.pages.farmOverview.critical,
        variant: 'destructive' as const,
        className: '',
      },
    };

    const config = statusConfig[status];

    return (
      <Badge
        variant={config.variant}
        className={cn(
          'gap-1.5 px-3 py-1.5 font-semibold shadow-sm',
          config.className,
        )}
      >
        {status === 'critical' && <AlertTriangle className="h-3.5 w-3.5" />}
        {config.label}
      </Badge>
    );
  };

  const formatLastIrrigation = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${t.pages.farmOverview.minutesAgo}`;
    }
    if (diffHours < 24) {
      return `${diffHours} ${t.pages.farmOverview.hoursAgo}`;
    }
    return `${diffDays} ${t.pages.farmOverview.daysAgo}`;
  };

  const getParameterStatus = (
    value: number,
    normal: { min: number; max: number },
    warning: { min: number; max: number },
  ): TunnelStatus => {
    if (value >= normal.min && value <= normal.max) {
      return 'normal';
    }
    if (value >= warning.min && value <= warning.max) {
      return 'warning';
    }
    return 'critical';
  };

  // Calculate status for each parameter
  const tempStatus = getParameterStatus(
    tunnel.environment.temperature,
    { min: 18, max: 25 },
    { min: 15, max: 28 },
  );
  const humidityStatus = getParameterStatus(
    tunnel.environment.humidity,
    { min: 50, max: 75 },
    { min: 40, max: 85 },
  );
  const co2Status = getParameterStatus(
    tunnel.environment.co2,
    { min: 350, max: 450 },
    { min: 300, max: 500 },
  );
  const lightStatus = getParameterStatus(
    tunnel.environment.light,
    { min: 200, max: 600 },
    { min: 150, max: 700 },
  );
  const moistureStatus = getParameterStatus(
    tunnel.irrigation.soilMoisture,
    { min: 40, max: 70 },
    { min: 30, max: 80 },
  );
  const soilECStatus = getParameterStatus(
    tunnel.irrigation.soilEC,
    { min: 1.5, max: 2.5 },
    { min: 1.0, max: 3.0 },
  );

  return (
    <Card
      className={cn(
        'gap-0 border-2 py-0 pt-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md',
        'from-card to-card/50 bg-gradient-to-br',
        tunnel.status === 'critical' &&
          'border-destructive/60 dark:border-destructive/60 shadow-destructive/10 hover:bg-destructive/10 dark:hover:bg-destructive/5',
        tunnel.status === 'warning' &&
          'border-chart-5/60 dark:border-chart-5/60 shadow-chart-5/10 hover:bg-chart-5/10 dark:hover:bg-chart-5/5',
        tunnel.status === 'normal' &&
          'border-primary/30 dark:border-primary/20 shadow-primary/5 hover:bg-primary/10 dark:hover:bg-primary/5',
      )}
    >
      <CardHeader className="border-border/50 dark:border-border/30 bg-muted/30 dark:bg-muted/10 border-b px-4 py-0 !pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-xl font-bold tracking-tight dark:text-white">
            {tunnel.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {tunnel.hasAlert && (
              <Badge
                variant="destructive"
                className="gap-1.5 px-2.5 py-1 shadow-sm"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {tunnel.alertCount}
              </Badge>
            )}
            {tunnel.hasWarning && !tunnel.hasAlert && (
              <Badge
                variant="secondary"
                className="gap-1.5 border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-700 shadow-sm dark:text-yellow-400"
              >
                <Bell className="h-3.5 w-3.5" />
                {tunnel.warningCount}
              </Badge>
            )}
            {getStatusBadge(tunnel.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {/* Environment Section */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-md bg-blue-500/10 p-1.5 dark:bg-blue-500/20">
              <Thermometer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-foreground/90 text-sm font-bold tracking-wide uppercase dark:text-white">
              {t.pages.farmOverview.environment}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <SensorGauge
              label={t.pages.farmOverview.temperature}
              value={tunnel.environment.temperature}
              unit="°C"
              min={10}
              max={30}
              normalMin={18}
              normalMax={25}
              warningMin={15}
              warningMax={28}
              status={tempStatus}
            />
            <SensorGauge
              label={t.pages.farmOverview.humidity}
              value={tunnel.environment.humidity}
              unit="%"
              min={30}
              max={90}
              normalMin={50}
              normalMax={75}
              warningMin={40}
              warningMax={85}
              status={humidityStatus}
            />
            <SensorGauge
              label={t.pages.farmOverview.co2}
              value={tunnel.environment.co2}
              unit="ppm"
              min={250}
              max={550}
              normalMin={350}
              normalMax={450}
              warningMin={300}
              warningMax={500}
              status={co2Status}
            />
            <SensorGauge
              label={t.pages.farmOverview.light}
              value={tunnel.environment.light}
              unit={t.pages.farmOverview.lightUnit}
              min={0}
              max={800}
              normalMin={200}
              normalMax={600}
              warningMin={150}
              warningMax={700}
              status={lightStatus}
            />
          </div>
        </div>

        {/* Irrigation Section */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="rounded-md bg-cyan-500/10 p-1.5 dark:bg-cyan-500/20">
              <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-foreground/90 text-sm font-bold tracking-wide uppercase dark:text-white">
              {t.pages.farmOverview.irrigation}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <SensorGauge
              label={t.pages.farmOverview.soilEC}
              value={tunnel.irrigation.soilEC}
              unit="dS/m"
              min={0.5}
              max={3.5}
              normalMin={1.5}
              normalMax={2.5}
              warningMin={1.0}
              warningMax={3.0}
              status={soilECStatus}
            />
            <SensorGauge
              label={t.pages.farmOverview.soilMoisture}
              value={tunnel.irrigation.soilMoisture}
              unit="%"
              min={20}
              max={90}
              normalMin={40}
              normalMax={70}
              warningMin={30}
              warningMax={80}
              status={moistureStatus}
            />
          </div>
          <div className="border-border/50 dark:border-border/30 mt-3 border-t pt-3">
            <div className="from-muted/60 to-muted/40 dark:from-muted/30 dark:to-muted/20 border-border/30 dark:border-border/20 flex items-center justify-between rounded-lg border bg-gradient-to-r px-2 py-2.5">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase dark:text-gray-300">
                {t.pages.farmOverview.lastIrrigation}
              </p>
              <span className="text-foreground text-sm font-bold dark:text-white">
                {formatLastIrrigation(tunnel.irrigation.lastIrrigation)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
