'use client';

import ErrorPage from '@/components/ui/error-page';
import { BarChart3 } from 'lucide-react';

export default function FarmOverviewErrorPage({
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
      title="Farm Overview Error"
      description="Something went wrong with the farm overview. Your other farm sections are still working."
      sectionName="Farm Overview"
      theme="green"
      resetLabel="Reload Overview"
      backLink={{
        href: '/tenant/dashboard',
        label: 'Back to Dashboard',
        icon: BarChart3,
      }}
    />
  );
}
