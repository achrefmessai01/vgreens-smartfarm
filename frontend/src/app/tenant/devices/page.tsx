'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/generated/graphql';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { FeatureGuard } from '@/components/features/feature-guard';
import { DeviceDashboard } from '@/components/devices';

export default function DeviceStatusPage() {
  const router = useRouter();
  const { role, loading } = useCurrentUser();

  // Device fleet health is for tenant admins (and vGreens admins) only.
  const allowed =
    role === UserRole.TenantAdmin || role === UserRole.VgreensAdmin;

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
      <DeviceDashboard />
    </FeatureGuard>
  );
}
