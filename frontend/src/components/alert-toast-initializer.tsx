'use client';

import { type User } from '@/generated/graphql';
import { useAlertToastListener } from '@/lib/hooks/use-alert-toast-listener';

interface AlertToastInitializerProps {
  user?: User;
}

/**
 * Component to initialize alert toast listener on app startup
 * Should be placed in the root layout to ensure it runs early
 */
export function AlertToastInitializer({ user }: AlertToastInitializerProps) {
  useAlertToastListener(user);

  return null;
}
