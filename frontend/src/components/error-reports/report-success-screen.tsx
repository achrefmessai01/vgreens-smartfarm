'use client';

import Link from 'next/link';
import { CheckCircle, FileText, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ReportSuccessScreenProps {
  reportId: string | null;
}

export function ReportSuccessScreen({ reportId }: ReportSuccessScreenProps) {
  const { t } = useI18n();
  const reportT = t.pages.report;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-8 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative w-full max-w-md rounded-2xl border border-green-200/50 bg-white/90 p-6 shadow-2xl shadow-green-200/40 backdrop-blur-xl sm:p-8 dark:border-green-500/20 dark:bg-gray-900/60 dark:shadow-green-500/25">
        <div className="absolute top-4 right-4">
          <Sparkles className="h-5 w-5 animate-pulse text-green-500 dark:text-green-400" />
        </div>

        <div className="space-y-8 text-center">
          <div className="relative">
            <div className="mx-auto flex h-20 w-20 transform items-center justify-center rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-100/80 to-green-200/60 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105 dark:border-green-500/20 dark:from-green-500/20 dark:to-green-600/30">
              <CheckCircle className="h-10 w-10 animate-pulse text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute inset-0 -z-10 mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-green-100/80 to-green-200/60 opacity-30 blur-xl dark:from-green-500/20 dark:to-green-600/30 dark:opacity-50" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl leading-tight font-bold text-gray-900 sm:text-3xl dark:text-white">
              {reportT.successTitle}
            </h2>
            <p className="mx-auto max-w-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {reportT.successDescription}
            </p>

            {reportId && (
              <div className="pt-4">
                <Link href={`/report-status?id=${reportId}`}>
                  <button className="inline-flex transform items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                    <FileText className="h-4 w-4" />
                    {reportT.viewReportStatus}
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-500">
            {reportT.redirectingHint}
          </div>
        </div>
      </div>
    </div>
  );
}
