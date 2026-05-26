'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { AlertCircle } from 'lucide-react';

export default function WarningsErrorPage({
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
      title={t.errors.warnings.title}
      description={t.errors.warnings.description}
      sectionName={t.errors.warnings.section}
      theme="orange"
      resetLabel={t.errors.warnings.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: AlertCircle,
      }}
    />
  );
}
