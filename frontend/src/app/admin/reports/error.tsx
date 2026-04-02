'use client';

import ErrorPage from '@/components/ui/error-page';

export default function AdminReportsError({
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
      title="Something went wrong!"
      description="We encountered an error while loading the reports management page."
      theme="blue"
    />
  );
}
