'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Building2 } from 'lucide-react';

export default function TenantErrorPage({
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
      title={t.errors.tenant.title}
      description={t.errors.tenant.description}
      sectionName={t.errors.tenant.section}
      theme="orange"
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Building2,
      }}
    />
  );
}
