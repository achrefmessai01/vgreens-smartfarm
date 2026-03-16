'use client';

import { UserRole } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { SignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const { role, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!isSignedIn) return;

    // Wait for user data to load
    if (userLoading) return;

    // Check user role and redirect to appropriate dashboard
    if (role === UserRole.VgreensAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/tenant/dashboard');
    }
  }, [isSignedIn, router, role, userLoading]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
