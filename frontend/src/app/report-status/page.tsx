'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/i18n'
import { useErrorReport } from '@/lib/hooks/use-error-reports'
import {
  ReportStatusHeader,
  ReportStatusTimeline,
  ReportStatusInfo,
  ReportStatusDetails,
  ReportStatusContact,
} from '@/components/report-status'

export default function ReportStatusPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('id') || ''
  
  const { data, loading, error } = useErrorReport(reportId)
  const report = data?.errorReport

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>

          <span>Loading report status...</span>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-lg font-semibold">Report Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The report you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <Link href="/tenant/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <ReportStatusHeader report={report} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ReportStatusDetails report={report} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ReportStatusTimeline report={report} />
            <ReportStatusInfo report={report} />
            <ReportStatusContact />
          </div>
        </div>
      </div>
    </div>
  )
}