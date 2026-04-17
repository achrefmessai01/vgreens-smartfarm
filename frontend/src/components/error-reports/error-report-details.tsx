'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorReport, ReportSeverity } from '@/generated/graphql';
import { ErrorReportStatusBadge } from './error-report-status-badge';
import { ErrorReportSeverityBadge } from './error-report-severity-badge';
import { formatDateTime } from '@/lib/utils/error-report-utils';
import {
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';

interface ErrorReportDetailsProps {
  report: ErrorReport | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (
    id: string,
    data: { adminNotes?: string; severity?: ReportSeverity },
  ) => Promise<void>;
  isUpdating?: boolean;
}

export function ErrorReportDetails({
  report,
  open,
  onClose,
  onUpdate,
  isUpdating = false,
}: ErrorReportDetailsProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [severity, setSeverity] = useState<ReportSeverity>(
    ReportSeverity.Medium,
  );

  React.useEffect(() => {
    if (report) {
      setAdminNotes(report.adminNotes || '');
      setSeverity(report.severity);
    }
  }, [report]);

  const handleUpdate = async () => {
    if (report) {
      await onUpdate(report.id, {
        adminNotes,
        severity,
      });
      onClose();
    }
  };

  if (!report) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-full overflow-y-auto px-4 py-5 sm:max-w-2xl sm:px-6 sm:py-6">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <SheetTitle className="text-xl break-words">
                Error Report Details
              </SheetTitle>
              <SheetDescription>
                Review and update error report information
              </SheetDescription>
            </div>
            <div className="shrink-0">
              <ErrorReportStatusBadge status={report.status} />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4 sm:py-6">
          {/* Report Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start gap-2 text-base">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-words">{report.errorTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ErrorReportSeverityBadge
                  severity={report.severity}
                  showPriority
                />
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(report.createdAt)}
                </Badge>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <span className="block font-medium">
                    {report.user.firstName} {report.user.lastName}
                  </span>
                  <span className="block break-all text-gray-500">
                    {report.userEmail}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Details */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <AlertTriangle className="h-4 w-4" />
              Error Description
            </h4>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 dark:text-white">
                  {report.errorDetails}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reproduction Steps */}
          {report.reproductionSteps && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Steps to Reproduce
              </h4>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 dark:text-white">
                    {report.reproductionSteps}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expected vs Actual */}
          {report.expectedVsActual && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected vs Actual
              </h4>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 dark:text-white">
                    {report.expectedVsActual}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Admin Controls */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-base">Admin Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Severity Level
                </label>
                <Select
                  value={severity}
                  onValueChange={(value: ReportSeverity) => setSeverity(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReportSeverity.Low}>Low</SelectItem>
                    <SelectItem value={ReportSeverity.Medium}>
                      Medium
                    </SelectItem>
                    <SelectItem value={ReportSeverity.High}>High</SelectItem>
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
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <Button
              onClick={handleUpdate}
              className="flex w-full items-center gap-2 sm:flex-1"
              disabled={isUpdating}
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Loading...' : 'Update Report'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="flex w-full items-center gap-2 sm:w-auto"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
