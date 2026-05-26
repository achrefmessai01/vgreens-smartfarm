'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Home } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    posthog.captureException(error);
    console.error(error);
  }, [error]);
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title={t.errors.app.title}
      description={t.errors.app.description}
      theme="red"
      backLink={{
        href: '/',
        label: t.common.goHome,
        icon: Home,
      }}
    />
  );
}
