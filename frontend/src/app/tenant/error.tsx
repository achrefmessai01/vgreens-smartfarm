'use client';

import ErrorPage from '@/components/ui/error-page';
import { Building2 } from 'lucide-react';

export default function TenantErrorPage({
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
      title="Dashboard Error"
      description="An error occurred in your farm dashboard. Other sections should still be working."
      sectionName="Tenant"
      theme="orange"
      backLink={{
        href: '/tenant/dashboard',
        label: 'Back to Dashboard',
        icon: Building2,
      }}
    />
  );
}
