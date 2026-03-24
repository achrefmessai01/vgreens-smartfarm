'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { useUser as useUserClerk } from '@clerk/nextjs';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser } = useUserClerk();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      defaults: '2025-05-24',
    });
  }, []);

  // Identify user when they log in and log location and device information
  useEffect(() => {
    if (clerkUser) {
      posthog.identify(clerkUser.id, {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name:
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        clerkUserId: clerkUser.id,
        createdAt: clerkUser.createdAt,
        location: navigator.geolocation.getCurrentPosition((position) => {
          return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }),
        device: {
          userAgent: navigator.userAgent,
          screenWidth: screen.width,
          screenHeight: screen.height,
        },
      });
    }
  }, [clerkUser]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
