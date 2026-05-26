'use client';

import ErrorPage from '@/components/ui/error-page';
import { useI18n } from '@/i18n';
import { Camera } from 'lucide-react';

export default function CameraErrorPage({
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
      title={t.errors.camera.title}
      description={t.errors.camera.description}
      sectionName={t.errors.camera.section}
      theme="purple"
      resetLabel={t.errors.camera.resetLabel}
      backLink={{
        href: '/tenant/dashboard',
        label: t.common.backToDashboard,
        icon: Camera,
      }}
    />
  );
}
