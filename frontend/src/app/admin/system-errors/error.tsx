'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { RotateCcw } from 'lucide-react';

export default function SystemErrorsErrorPage({
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
      title={t.errors.adminSystemErrors.title}
      description={t.errors.adminSystemErrors.description}
      sectionName={t.errors.adminSystemErrors.section}
      theme="red"
      backLink={{
        href: '/admin/dashboard',
        label: t.common.backToDashboard,
        icon: RotateCcw,
      }}
      resetLabel={t.errors.adminSystemErrors.resetLabel}
    />
  );
}
