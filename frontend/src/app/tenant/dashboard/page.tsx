'use client'

import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout'
import { DashboardContent } from '@/components/dashboard'
import { getDefaultDashboardContentProps } from '@/components/dashboard/default-dashboard-data'

export default function TenantDashboardPage() {
  const { t } = useI18n()
  const contentProps = getDefaultDashboardContentProps()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.admin.dashboard.title}
        subtitle={t.pages.admin.dashboard.subtitle}
      />
      <DashboardContent {...contentProps} />
    </div>
  )
}
