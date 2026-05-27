'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';

export default function ReportStatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title={t.errors.reportStatus.title}
      description={t.errors.reportStatus.description}
      theme="orange"
    />
  );
}
