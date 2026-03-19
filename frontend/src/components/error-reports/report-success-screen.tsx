import Link from 'next/link';
import { CheckCircle, FileText, Sparkles } from 'lucide-react';

interface ReportSuccessScreenProps {
  reportId: string | null;
}

export function ReportSuccessScreen({ reportId }: ReportSuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl border border-green-200/50 dark:border-green-500/20 rounded-2xl shadow-2xl shadow-green-200/40 dark:shadow-green-500/25 p-6 sm:p-8">
        <div className="absolute top-4 right-4">
          <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400 animate-pulse" />
        </div>

        <div className="text-center space-y-8">
          <div className="relative">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-500/20 dark:to-green-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-green-200/50 dark:border-green-500/20 transform hover:scale-105 transition-transform duration-300">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-500/20 dark:to-green-600/30 rounded-2xl blur-xl opacity-30 dark:opacity-50 -z-10" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Report Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              Thank you for your report. Our team will review it and get back to you soon.
            </p>

            {reportId && (
              <div className="pt-4">
                <Link href={`/report-status?id=${reportId}`}>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white font-medium rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <FileText className="h-4 w-4" />
                    View Report Status
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to report status in 3 seconds...
          </div>
        </div>
      </div>
    </div>
  );
}
