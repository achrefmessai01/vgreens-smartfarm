'use client';

import ErrorPage from '@/components/ui/error-page';
import { Settings } from 'lucide-react';

export default function AdminErrorPage({
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
      title="Admin Section Error"
      description="Something went wrong in the admin section. Other parts of the app should still work."
      sectionName="Admin"
      theme="indigo"
      backLink={{
        href: '/admin/dashboard',
        label: 'Back to Admin Dashboard',
        icon: Settings,
      }}
    />
  );
}
