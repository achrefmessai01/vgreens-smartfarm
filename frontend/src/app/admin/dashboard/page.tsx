'use client'

import { useI18n } from '@/i18n'
import { PageHeader } from '@/components/layout'

export default function AdminDashboardPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.admin.dashboard.title}
        subtitle={t.pages.admin.dashboard.subtitle}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {t.pages.admin.dashboard.totalTenants}
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {t.pages.admin.dashboard.totalUsers}
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {t.pages.admin.dashboard.activeFeatures}
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">
            {t.pages.admin.dashboard.systemStatus}
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
    </div>
  )
}
