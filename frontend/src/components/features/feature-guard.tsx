'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/generated/graphql';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features';
import { findFallbackRoute, getRouteDisplayName } from '@/lib/utils/feature-routes';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { FeatureNotAvailableCard } from '@/components/ui/feature-not-available-card';

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  skeleton?: React.ReactNode;
}

export function FeatureGuard({
  featureKey,
  children,
  fallback,
  redirectTo,
  skeleton,
}: FeatureGuardProps) {
  const { role } = useCurrentUser();
  const isVGreensAdmin = role === UserRole.VgreensAdmin;
  const { hasFeature, enabledFeatures, dataLoaded } = useTenantFeatures();
  const router = useRouter();

  // VGreens admins can access everything
  if (isVGreensAdmin) {
    return <>{children}</>;
  }

  // Show loading state while features are being loaded
  if (!dataLoaded) {
    return skeleton || <PageSkeleton />;
  }

  // If feature is not enabled, show "Feature Not Available" card
  if (!hasFeature(featureKey)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Find the best fallback route
    const targetRoute =
      redirectTo || findFallbackRoute(enabledFeatures) || '/tenant/dashboard';
    const targetRouteName = getRouteDisplayName(targetRoute);

    const handleRedirect = () => {
      router.push(targetRoute);
    };

    return (
      <FeatureNotAvailableCard
        title="Feature Not Available"
        description="This feature is not enabled for your tenant. Please contact your administrator to request access to this feature."
        badgeText="Not Available"
        onRedirect={handleRedirect}
        redirectLabel={`Go to ${targetRouteName}`}
      />
    );
  }

  // Feature is enabled - render children
  return <>{children}</>;
}
