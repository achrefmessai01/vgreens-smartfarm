'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Settings } from 'lucide-react';

export default function AdminErrorPage({
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
      title={t.errors.admin.title}
      description={t.errors.admin.description}
      sectionName={t.errors.admin.section}
      theme="indigo"
      backLink={{
        href: '/admin/dashboard',
        label: t.errors.admin.backLabel,
        icon: Settings,
      }}
    />
  );
}
