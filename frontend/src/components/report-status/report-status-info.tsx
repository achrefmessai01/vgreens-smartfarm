'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorReport } from '@/generated/graphql';
import { formatDateTime } from '@/lib/utils/error-report-utils';
import { useI18n } from '@/i18n';
import { User } from 'lucide-react';

interface ReportStatusInfoProps {
  report: ErrorReport;
}

export function ReportStatusInfo({ report }: ReportStatusInfoProps) {
  const { t } = useI18n();

  const infoData = [
    {
      label: t.pages.reportStatus.info.reportId,
      value: `${report.id.slice(0, 8)}...`,
    },
    {
      label: t.pages.reportStatus.info.submittedBy,
      value: `${report.user.firstName} ${report.user.lastName}`,
      subtitle: report.userEmail,
    },
    {
      label: t.pages.reportStatus.info.lastUpdated,
      value: formatDateTime(report.updatedAt),
    },
    ...(report.resolvedByUser
      ? [
          {
            label: t.pages.reportStatus.info.resolvedBy,
            value: `${report.resolvedByUser.firstName} ${report.resolvedByUser.lastName}`,
          },
        ]
      : []),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t.pages.reportStatus.info.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {infoData.map((item, index) => (
            <div key={index}>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </div>
              <div className="font-mono text-sm text-gray-900 dark:text-white">
                {item.value}
              </div>
              {item.subtitle && (
                <div className="text-xs text-gray-500">{item.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
