'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AppLayout } from '@/components/layout';
import { useRouter, usePathname } from 'next/navigation';
import { AlertToastInitializer } from '@/components/alert-toast-initializer';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    if (loading) {
      return;
    }
    // VgreensAdmin is allowed to access tenant routes as well,
    // so we intentionally do not redirect them away from /tenant here.
  }, [isSignedIn, isLoaded, router, pathname, loading]);

  if (!isLoaded || !isSignedIn || loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <AlertToastInitializer user={user || undefined} />
      <AppLayout user={user || undefined}>{children}</AppLayout>
    </>
  );
}
