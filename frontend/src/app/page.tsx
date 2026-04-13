'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const { role, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    // Wait for user data to load
    if (userLoading) {
      return;
    }

    // Redirect to first meaningful page per role (dashboard not yet implemented)
    if (role === UserRole.VgreensAdmin) {
      router.push('/admin/tenants');
    } else {
      router.push('/tenant/farm-overview');
    }
  }, [isSignedIn, isLoaded, router, role, userLoading]);

  return <PageSkeleton />;
}
