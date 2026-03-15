'use client'

import { Badge } from '@/components/ui/badge'
import { ErrorReport } from '@/generated/graphql'
import { getStatusConfig } from '@/lib/utils/error-report-utils'
import { useI18n } from '@/i18n'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ReportStatusHeaderProps {
  report: ErrorReport
}

export function ReportStatusHeader({ report }: ReportStatusHeaderProps) {
  const { t } = useI18n()
  const statusInfo = getStatusConfig(report.status)
  const StatusIcon = statusInfo.icon

  const statusDescriptions = {
    [report.status]: t.pages.reportStatus.status[
      report.status === 'OPEN' ? 'openDescription' :
      report.status === 'IN_PROGRESS' ? 'inProgressDescription' :
      'resolvedDescription'
    ]
  }

  return (
    <div className="mb-8">
      <Link 
        href="/tenant/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
        {t.pages.reportStatus.backToDashboard}
      </Link>
      
      <div className="text-center space-y-4">
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.pages.reportStatus.title}
          </h1>
          <Badge variant={statusInfo.variant} className="mt-2">
            {t.pages.reportStatus.status[
              report.status === 'OPEN' ? 'open' :
              report.status === 'IN_PROGRESS' ? 'inProgress' :
              'resolved'
            ]}
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {statusDescriptions[report.status]}
        </p>
      </div>
    </div>
  )
}