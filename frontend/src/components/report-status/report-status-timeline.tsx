'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorReport, ReportStatus } from '@/generated/graphql';
import {
  formatDateTime,
  getTimelineStatus,
} from '@/lib/utils/error-report-utils';
import { useI18n } from '@/i18n';
import { Clock } from 'lucide-react';

interface ReportStatusTimelineProps {
  report: ErrorReport;
}

export function ReportStatusTimeline({ report }: ReportStatusTimelineProps) {
  const { t } = useI18n();

  const timelineSteps = [
    {
      key: 'submitted',
      status: ReportStatus.Open,
      label: t.pages.reportStatus.timeline.submitted,
      timestamp: formatDateTime(report.createdAt),
      description: null,
    },
    {
      key: 'inProgress',
      status: ReportStatus.InProgress,
      label: t.pages.reportStatus.status.inProgress,
      timestamp: null,
      description:
        report.status === ReportStatus.InProgress ||
        report.status === ReportStatus.Resolved
          ? t.pages.reportStatus.timeline.underInvestigation
          : t.pages.reportStatus.timeline.pendingReview,
    },
    {
      key: 'resolved',
      status: ReportStatus.Resolved,
      label: t.pages.reportStatus.status.resolved,
      timestamp: report.resolvedAt ? formatDateTime(report.resolvedAt) : null,
      description:
        report.status === ReportStatus.Resolved && report.resolvedAt
          ? formatDateTime(report.resolvedAt)
          : t.pages.reportStatus.timeline.pendingResolution,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t.pages.reportStatus.timeline.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const status = getTimelineStatus(report.status, step.status);
            const isCompleted = status === 'completed';

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isCompleted
                      ? 'bg-green-500'
                      : index === 0 || report.status === step.status
                        ? 'bg-yellow-500'
                        : 'bg-gray-300'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{step.label}</div>
                  <div className="text-xs text-gray-500">
                    {step.timestamp || step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
