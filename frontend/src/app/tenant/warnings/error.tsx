'use client';

import ErrorPage from '@/components/ui/error-page';
import { AlertCircle } from 'lucide-react';

export default function WarningsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Warnings Section Error"
      description="Something went wrong with the warnings section. Your other farm sections are still working."
      sectionName="Warnings"
      theme="orange"
      resetLabel="Reload Warnings"
      backLink={{
        href: '/tenant/dashboard',
        label: 'Back to Dashboard',
        icon: AlertCircle,
      }}
    />
  );
}
