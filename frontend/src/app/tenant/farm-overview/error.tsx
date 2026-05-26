'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { BarChart3 } from 'lucide-react';

export default function FarmOverviewErrorPage({
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
      title={t.errors.farmOverview.title}
      description={t.errors.farmOverview.description}
      sectionName={t.errors.farmOverview.section}
      theme="green"
      resetLabel={t.errors.farmOverview.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: BarChart3,
      }}
    />
  );
}
