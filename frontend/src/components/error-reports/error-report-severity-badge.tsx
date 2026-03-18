'use client'

import { Badge } from '@/components/ui/badge'
import { ReportSeverity } from '@/generated/graphql'
import { getSeverityConfig } from '@/lib/utils/error-report-utils'
import { useI18n } from '@/i18n'

interface ErrorReportSeverityBadgeProps {
  severity: ReportSeverity
  showPriority?: boolean
  className?: string
}

export function ErrorReportSeverityBadge({ 
  severity, 
  showPriority = false,
  className 
}: ErrorReportSeverityBadgeProps) {
  const { t } = useI18n()
  const config = getSeverityConfig(severity)

  const severityLabels = showPriority ? {
    [ReportSeverity.Low]: t.pages.admin.reports.severities.lowPriority,
    [ReportSeverity.Medium]: t.pages.admin.reports.severities.mediumPriority,
    [ReportSeverity.High]: t.pages.admin.reports.severities.highPriority,
    [ReportSeverity.Critical]: t.pages.admin.reports.severities.critical,
    [ReportSeverity.Urgent]: t.pages.admin.reports.severities.urgent,
  } : {
    [ReportSeverity.Low]: t.pages.admin.reports.severities.low,
    [ReportSeverity.Medium]: t.pages.admin.reports.severities.medium,
    [ReportSeverity.High]: t.pages.admin.reports.severities.high,
    [ReportSeverity.Critical]: t.pages.admin.reports.severities.critical,
    [ReportSeverity.Urgent]: t.pages.admin.reports.severities.urgent,
  }

  return (
    <Badge variant={config.variant} className={className}>
      {severityLabels[severity]}
    </Badge>
  )
}