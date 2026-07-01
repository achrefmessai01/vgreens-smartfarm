'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  const {
    role,
    loading: userLoading,
    error: userError,
    isVGreensInternal,
  } = useCurrentUser();

  const hasUnresolvedMeError = Boolean(userError) && !userLoading && !role;

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

    // If the `me` query errored and we have no role to act on, stay put
    // and let the UI below render an error state. Falling through here
    // would redirect VGreens admins to /tenant/farm-overview (since the
    // else branch is the catch-all), which is wrong.
    if (hasUnresolvedMeError) {
      return;
    }

    // Redirect to first meaningful page per role (dashboard not yet
    // implemented). Both internal vGreens roles land on /admin/tenants —
    // VGREENS_MEMBER is the read-only sibling and shares the admin surface.
    if (isVGreensInternal) {
      router.push('/admin/tenants');
    } else {
      router.push('/tenant/farm-overview');
    }
  }, [
    isSignedIn,
    isLoaded,
    router,
    isVGreensInternal,
    userLoading,
    hasUnresolvedMeError,
  ]);

  if (hasUnresolvedMeError) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">{t.errors.sessionLoad.title}</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          {t.errors.sessionLoad.description}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
        >
          {t.errors.sessionLoad.retry}
        </button>
      </div>
    );
  }

  return <PageSkeleton />;
}
