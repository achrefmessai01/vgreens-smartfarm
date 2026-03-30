'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SensorGauge } from './sensor-gauge';
import { Droplets } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { TunnelStatus } from '@/types/tunnel.types';

interface SystemOverviewProps {
  pH: number;
  waterEC: number;
}

export function SystemOverview({ pH, waterEC }: SystemOverviewProps) {
  const { t } = useI18n();

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

  const pHStatus = getParameterStatus(
    pH,
    { min: 5.5, max: 6.5 },
    { min: 5.0, max: 7.0 },
  );

  const waterECStatus = getParameterStatus(
    waterEC,
    { min: 1.2, max: 2.0 },
    { min: 1.0, max: 2.5 },
  );

  return (
    <Card className="from-card to-card/50 overflow-hidden border-2 bg-gradient-to-br">
      <CardHeader className="border-border/50 dark:border-border/30 bg-muted/30 dark:bg-muted/10 border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md bg-cyan-500/10 p-1.5 dark:bg-cyan-500/20">
            <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <CardTitle className="text-foreground text-base font-bold tracking-tight dark:text-white">
            {t.pages.farmOverview.systemOverview || 'System Overview'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="min-h-[500px] px-4 py-0">
        <div className="grid h-[450px] grid-cols-1 gap-6 sm:grid-cols-2">
          <SensorGauge
            label={t.pages.farmOverview.pH}
            value={pH}
            unit="pH"
            min={4.0}
            max={8.0}
            normalMin={5.5}
            normalMax={6.5}
            warningMin={5.0}
            warningMax={7.0}
            status={pHStatus}
          />
          <SensorGauge
            label={t.pages.farmOverview.waterEC}
            value={waterEC}
            unit="dS/m"
            min={0.5}
            max={3.0}
            normalMin={1.2}
            normalMax={2.0}
            warningMin={1.0}
            warningMax={2.5}
            status={waterECStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
}
