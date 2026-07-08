'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, useMeQuery } from '@/generated/graphql';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { FeatureGuard } from '@/components/features/feature-guard';
import { TenantPickRequired } from '@/components/tenant-pick-required';
import { DeviceDashboard } from '@/components/devices';

export default function DeviceStatusPage() {
  const router = useRouter();
  const { role, loading } = useCurrentUser();

  // Device fleet health is a vGreens-internal feature. Tenant admins only get
  // it when their tenant is opted in via settings.deviceStatusForTenantAdmins
  // (toggled by a vGreens admin; the deviceActivitySeries resolver enforces
  // the same rule server-side).
  //
  // The check deliberately bypasses the Apollo cache: the app shell keeps a
  // Me observable mounted for the whole session (navbar/sidebar), so the
  // cached settings blob can be stale — e.g. access revoked while this tenant
  // admin was logged in, or granted-then-revoked during the session. Entering
  // this page always re-verifies against the server and fails closed.
  const { data: freshMe, loading: meLoading } = useMeQuery({
    fetchPolicy: 'network-only',
    skip: role !== UserRole.TenantAdmin,
  });
  const deviceStatusForTenantAdmins =
    freshMe?.me?.tenant?.settings?.deviceStatusForTenantAdmins ?? false;
  const allowed =
    role === UserRole.VgreensAdmin ||
    (role === UserRole.TenantAdmin && deviceStatusForTenantAdmins);
  const checking =
    loading || (role === UserRole.TenantAdmin && meLoading);

  useEffect(() => {
    if (!checking && role && !allowed) {
      router.replace('/tenant/dashboard');
    }
  }, [checking, role, allowed, router]);

  if (checking) {
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
