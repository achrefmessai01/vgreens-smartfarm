'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { TunnelCard } from './tunnel-card';
import { SystemOverview } from './system-overview';
import type { Tunnel } from '@/types/tunnel.types';
import type { SystemIrrigationData } from '@/lib/tunnel-data';

interface FarmOverviewProps {
  tunnels: Tunnel[];
  systemIrrigation: SystemIrrigationData;
}

export function FarmOverview({ tunnels, systemIrrigation }: FarmOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* System Overview - pH and Water EC (system-wide) */}
      <SystemOverview
        pH={systemIrrigation.pH}
        waterEC={systemIrrigation.waterEC}
      />

      <div className="border-border/50 dark:border-border/30 flex items-center justify-between border-b pb-2">
        <div>
          <p className="text-muted-foreground text-sm font-semibold dark:text-white">
            {t.pages.farmOverview.greenhouses}:{' '}
            <span className="text-foreground font-bold dark:text-white">
              {tunnels.length}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tunnels.map((tunnel) => (
          <TunnelCard key={tunnel.id} tunnel={tunnel} />
        ))}
      </div>
    </div>
  );
}
