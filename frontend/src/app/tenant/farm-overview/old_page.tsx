'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { FarmOverview } from '@/components/farm-overview'
import { PageHeader } from '@/components/layout/page-header'
import { FeatureGuard } from '@/components/features/feature-guard'
import { getAllTunnels, getSystemIrrigationData } from '@/lib/tunnel-data'

export default function FarmOverviewPage() {
  const { t } = useI18n()
  const [tunnels] = React.useState(() => getAllTunnels())
  const [systemIrrigation] = React.useState(() => getSystemIrrigationData())

  return (
    <FeatureGuard featureKey="farm_overview">
      <div className="flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <PageHeader title={t.pages.farmOverview.title} />
        </div>

        <div className="pb-4">
          <FarmOverview tunnels={tunnels} systemIrrigation={systemIrrigation} />
        </div>
      </div>
    </FeatureGuard>
  )
}
