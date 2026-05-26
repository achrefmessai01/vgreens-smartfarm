'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Layout } from 'lucide-react';

export default function DashboardErrorPage({
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
      title={t.errors.dashboard.title}
      description={t.errors.dashboard.description}
      sectionName={t.errors.dashboard.section}
      theme="blue"
      resetLabel={t.errors.dashboard.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Layout,
      }}
    />
  );
}
