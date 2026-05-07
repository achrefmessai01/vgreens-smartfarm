'use client';

import { useCurrentUser } from '@/lib/hooks/use-current-user';

export const HARVEST_CLASS_B_TENANT_ID = 'ed458942-f834-4f06-aa21-8d46b5ed8829';

export function useHarvestClassBMode(): boolean {
  const { user } = useCurrentUser();
  return user?.tenantId === HARVEST_CLASS_B_TENANT_ID;
}
