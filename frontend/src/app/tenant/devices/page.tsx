'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/generated/graphql';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { FeatureGuard } from '@/components/features/feature-guard';
import { TenantPickRequired } from '@/components/tenant-pick-required';
import { DeviceDashboard } from '@/components/devices';

export default function DeviceStatusPage() {
  const router = useRouter();
  const { role, user, loading } = useCurrentUser();

  // Device fleet health is a vGreens-internal feature. Tenant admins only get
  // it when their tenant is opted in via settings.deviceStatusForTenantAdmins
  // (toggled by a vGreens admin; the deviceActivitySeries resolver enforces
  // the same rule server-side).
  const deviceStatusForTenantAdmins =
    user?.tenant?.settings?.deviceStatusForTenantAdmins ?? false;
  const allowed =
    role === UserRole.VgreensAdmin ||
    (role === UserRole.TenantAdmin && deviceStatusForTenantAdmins);

  useEffect(() => {
    if (!loading && role && !allowed) {
      router.replace('/tenant/dashboard');
    }
  }, [loading, role, allowed, router]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!allowed) {
    return null;
  }

  return (
    <FeatureGuard featureKey="device_status">
      <TenantPickRequired>
        <DeviceDashboard />
      </TenantPickRequired>
    </FeatureGuard>
  );
}
