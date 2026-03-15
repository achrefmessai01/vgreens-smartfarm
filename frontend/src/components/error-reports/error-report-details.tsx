'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorReport, ReportSeverity } from '@/generated/graphql'
import { ErrorReportStatusBadge } from './error-report-status-badge'
import { ErrorReportSeverityBadge } from './error-report-severity-badge'
import { formatDateTime } from '@/lib/utils/error-report-utils'
import { Calendar, User, MessageSquare, AlertTriangle, Save, X } from 'lucide-react'

interface ErrorReportDetailsProps {
  report: ErrorReport | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: { adminNotes?: string; severity?: ReportSeverity }) => Promise<void>
  isUpdating?: boolean
}

export function ErrorReportDetails({ 
  report, 
  open, 
  onClose, 
  onUpdate,
  isUpdating = false 
}: ErrorReportDetailsProps) {
  const [adminNotes, setAdminNotes] = useState('')
  const [severity, setSeverity] = useState<ReportSeverity>(ReportSeverity.Medium)

  React.useEffect(() => {
    if (report) {
      setAdminNotes(report.adminNotes || '')
      setSeverity(report.severity)
    }
  }, [report])

  const handleUpdate = async () => {
    if (report) {
      await onUpdate(report.id, {
        adminNotes,
        severity
      })
      onClose()
    }
  }

  if (!report) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto px-6 py-6">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl">Error Report Details</SheetTitle>
              <SheetDescription>
                Review and update error report information
              </SheetDescription>
            </div>
            <ErrorReportStatusBadge status={report.status} />
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Report Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                {report.errorTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ErrorReportSeverityBadge severity={report.severity} showPriority />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(report.createdAt)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <div>
                  <span className="font-medium">
                    {report.user.firstName} {report.user.lastName}
                  </span>
                  <span className="text-gray-500 ml-2">({report.userEmail})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Details */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Description
            </h4>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                  {report.errorDetails}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reproduction Steps */}
          {report.reproductionSteps && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Steps to Reproduce
              </h4>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {report.reproductionSteps}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expected vs Actual */}
          {report.expectedVsActual && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Expected vs Actual
              </h4>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {report.expectedVsActual}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Admin Controls */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-base">Admin Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Severity Level
                </label>
                <Select value={severity} onValueChange={(value: ReportSeverity) => setSeverity(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReportSeverity.Low}>
                      Low
                    </SelectItem>
                    <SelectItem value={ReportSeverity.Medium}>
                      Medium
                    </SelectItem>
                    <SelectItem value={ReportSeverity.High}>
                      High
                    </SelectItem>
                    <SelectItem value={ReportSeverity.Critical}>
                      Critical
                    </SelectItem>
                    <SelectItem value={ReportSeverity.Urgent}>
                      Urgent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin Notes
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about investigation, resolution, etc."
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleUpdate} 
              className="flex-1 flex items-center gap-2"
              disabled={isUpdating}
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Loading...' : 'Update Report'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}