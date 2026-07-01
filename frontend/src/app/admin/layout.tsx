'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AppLayout } from '@/components/layout';
import { useRouter, usePathname } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading, isVGreensInternal } = useCurrentUser();

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

    // Both internal vGreens roles see the admin surface — VGREENS_MEMBER is
    // the read-only sibling and shares every visibility rule with the admin.
    // Tenant-scoped roles get bounced back to /tenant/dashboard.
    if (role && !isVGreensInternal) {
      if (!pathname?.startsWith('/tenant')) {
        router.replace('/tenant/dashboard');
      }
      return;
    }
  }, [isSignedIn, isLoaded, router, pathname, role, loading, isVGreensInternal]);

  if (!isLoaded || !isSignedIn || loading) {
    return <PageSkeleton />;
  }

  if (!isVGreensInternal) {
    return null;
  }

  return <AppLayout user={user || undefined}>{children}</AppLayout>;
}
