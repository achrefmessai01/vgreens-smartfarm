'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Clock } from 'lucide-react';

export default function HistoryErrorPage({
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
      title={t.errors.history.title}
      description={t.errors.history.description}
      sectionName={t.errors.history.section}
      theme="cyan"
      resetLabel={t.errors.history.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Clock,
      }}
    />
  );
}
