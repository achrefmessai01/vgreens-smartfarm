'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { TunnelCard } from './tunnel-card'
import { SystemOverview } from './system-overview'
import type { Tunnel } from '@/lib/tunnel-types'
import type { SystemIrrigationData } from '@/lib/tunnel-data'

interface FarmOverviewProps {
  tunnels: Tunnel[]
  systemIrrigation: SystemIrrigationData
}

export function FarmOverview({ tunnels, systemIrrigation }: FarmOverviewProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* System Overview - pH and Water EC (system-wide) */}
      <SystemOverview pH={systemIrrigation.pH} waterEC={systemIrrigation.waterEC} />

      <div className="flex items-center justify-between pb-2 border-b border-border/50 dark:border-border/30">
        <div>
          <p className="text-sm font-semibold text-muted-foreground dark:text-white">
            {t.pages.farmOverview.greenhouses}:{' '}
            <span className="font-bold text-foreground dark:text-white">
              {tunnels.length}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tunnels.map((tunnel) => (
          <TunnelCard key={tunnel.id} tunnel={tunnel} />
        ))}
      </div>
    </div>
  )
}
