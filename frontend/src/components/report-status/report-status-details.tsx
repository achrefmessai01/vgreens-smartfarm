'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorReport } from '@/generated/graphql';
import { ErrorReportSeverityBadge } from '@/components/error-reports';
import { useI18n } from '@/i18n';
import { FileText } from 'lucide-react';

interface ReportStatusDetailsProps {
  report: ErrorReport;
}

export function ReportStatusDetails({ report }: ReportStatusDetailsProps) {
  const { t } = useI18n();

  const details = [
    {
      label: t.pages.reportStatus.details.description,
      value: report.errorDetails,
      show: !!report.errorDetails,
    },
    {
      label: t.pages.reportStatus.details.reproductionSteps,
      value: report.reproductionSteps,
      show: !!report.reproductionSteps,
    },
    {
      label: t.pages.reportStatus.details.expectedVsActual,
      value: report.expectedVsActual,
      show: !!report.expectedVsActual,
    },
    {
      label: t.pages.reportStatus.details.adminNotes,
      value: report.adminNotes,
      show: !!report.adminNotes,
    },
  ].filter((item) => item.show);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t.pages.reportStatus.details.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {report.errorTitle}
          </h3>
          <div className="mb-4 flex gap-2">
            <ErrorReportSeverityBadge severity={report.severity} />
          </div>
        </div>

        <div className="space-y-4">
          {details.map((detail, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                {detail.label}
              </h4>
              <div
                className={`rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-900 dark:text-white ${
                  detail.label === t.pages.reportStatus.details.adminNotes
                    ? 'border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                {detail.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
