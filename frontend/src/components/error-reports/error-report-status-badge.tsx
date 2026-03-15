'use client'

import { Badge } from '@/components/ui/badge'
import { ReportStatus } from '@/generated/graphql'
import { getStatusConfig } from '@/lib/utils/error-report-utils'
import { useI18n } from '@/i18n'

interface ErrorReportStatusBadgeProps {
  status: ReportStatus
  showIcon?: boolean
  className?: string
}

export function ErrorReportStatusBadge({ 
  status, 
  showIcon = true, 
  className 
}: ErrorReportStatusBadgeProps) {
  const { t } = useI18n()
  const config = getStatusConfig(status)
  const Icon = config.icon

  const statusLabels = {
    [ReportStatus.Open]: t.pages.admin.reports.statuses.open,
    [ReportStatus.InProgress]: t.pages.admin.reports.statuses.inProgress,
    [ReportStatus.Resolved]: t.pages.admin.reports.statuses.resolved,
  }

  return (
    <Badge variant={config.variant} className={`${className} ${showIcon ? 'flex items-center gap-1' : ''}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      {statusLabels[status]}
    </Badge>
  )
}