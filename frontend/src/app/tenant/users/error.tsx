'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Users } from 'lucide-react';

export default function UsersErrorPage({
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
      title={t.errors.users.title}
      description={t.errors.users.description}
      sectionName={t.errors.users.section}
      theme="emerald"
      resetLabel={t.errors.users.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Users,
      }}
    />
  );
}
