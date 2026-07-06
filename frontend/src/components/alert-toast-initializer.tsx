'use client';

import type { UserData } from '@/lib/graphql-compat';
import { useAlertToastListener } from '@/lib/hooks/use-alert-toast-listener';

interface AlertToastInitializerProps {
  user?: UserData;
}

/**
 * Component to initialize alert toast listener on app startup
 * Should be placed in the root layout to ensure it runs early
 */
export function AlertToastInitializer({ user }: AlertToastInitializerProps) {
  useAlertToastListener(user);

  return null;
}
