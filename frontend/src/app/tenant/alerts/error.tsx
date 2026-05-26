'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Bell } from 'lucide-react';

export default function AlertsErrorPage({
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
      title={t.errors.alerts.title}
      description={t.errors.alerts.description}
      sectionName={t.errors.alerts.section}
      theme="red"
      resetLabel={t.errors.alerts.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Bell,
      }}
    />
  );
}
