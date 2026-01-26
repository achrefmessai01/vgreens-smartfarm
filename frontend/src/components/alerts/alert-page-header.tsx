'use client'

import { useI18n } from '@/i18n'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'

interface AlertPageHeaderProps {
  openAlertsCount: number
  onCreate: () => void
  isLoading?: boolean
}

export function AlertPageHeader({
  openAlertsCount,
  onCreate,
  isLoading = false,
}: AlertPageHeaderProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <PageHeader
        title={t.pages.alerts.title}
        subtitle={t.pages.alerts.subtitle}
      />
      <div className="flex items-center gap-3">
        {openAlertsCount > 0 && (
          <Badge variant="destructive" className="gap-2 px-3 py-1.5">
            <AlertTriangle className="h-4 w-4" />
            {openAlertsCount} {t.pages.alerts.critical}
          </Badge>
        )}
        <Button onClick={onCreate} disabled={isLoading}>
          {t.pages.alerts.createAlert}
        </Button>
      </div>
    </div>
  )
}
