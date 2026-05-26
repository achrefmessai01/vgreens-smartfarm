'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Wheat } from 'lucide-react';

export default function HarvestErrorPage({
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
      title={t.errors.harvest.title}
      description={t.errors.harvest.description}
      sectionName={t.errors.harvest.section}
      theme="yellow"
      resetLabel={t.errors.harvest.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Wheat,
      }}
    />
  );
}
