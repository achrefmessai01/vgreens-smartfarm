'use client'

import { useI18n } from '@/i18n'
import { Clock } from 'lucide-react'
import { ComingSoonCard } from '@/components/ui/coming-soon-card'
import { FeatureGuard } from '@/components/features/feature-guard'

export default function HistoryPage() {
  const { t } = useI18n()

  return (
    <FeatureGuard featureKey="data_analytics">
      <ComingSoonCard
        icon={Clock}
        title={t.pages.history.title}
        description="We're working on bringing you comprehensive history and analytics. This feature will be available soon!"
      />
    </FeatureGuard>
  )
}
