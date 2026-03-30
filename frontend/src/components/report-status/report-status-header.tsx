'use client';

import { Badge } from '@/components/ui/badge';
import { ErrorReport } from '@/generated/graphql';
import { getStatusConfig } from '@/lib/utils/error-report-utils';
import { useI18n } from '@/i18n';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReportStatusHeaderProps {
  report: ErrorReport;
}

export function ReportStatusHeader({ report }: ReportStatusHeaderProps) {
  const { t } = useI18n();
  const statusInfo = getStatusConfig(report.status);
  const StatusIcon = statusInfo.icon;

  const statusDescriptions = {
    [report.status]:
      t.pages.reportStatus.status[
        report.status === 'OPEN'
          ? 'openDescription'
          : report.status === 'IN_PROGRESS'
            ? 'inProgressDescription'
            : 'resolvedDescription'
      ],
  };

  return (
    <div className="mb-8">
      <Link
        href="/tenant/dashboard"
        className="group mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        {t.pages.reportStatus.backToDashboard}
      </Link>

      <div className="space-y-4 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg ${statusInfo.bgColor} ${statusInfo.borderColor}`}
        >
          <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.pages.reportStatus.title}
          </h1>
          <Badge variant={statusInfo.variant} className="mt-2">
            {
              t.pages.reportStatus.status[
                report.status === 'OPEN'
                  ? 'open'
                  : report.status === 'IN_PROGRESS'
                    ? 'inProgress'
                    : 'resolved'
              ]
            }
          </Badge>
        </div>
        <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
          {statusDescriptions[report.status]}
        </p>
      </div>
    </div>
  );
}
