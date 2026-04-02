'use client';

import {
  useToggleTenantFeatureMutation,
  useFeaturesWithTenantStatusQuery,
} from '@/generated/graphql';
import * as React from 'react';
import { FeatureList } from '@/components/features';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface TenantFeaturesTabProps {
  tenantId: string;
  active: boolean;
}

export function TenantFeaturesTab({
  tenantId,
  active,
}: TenantFeaturesTabProps) {
  const {
    data: featuresData,
    loading: featuresLoading,
    refetch: refetchFeatures,
  } = useFeaturesWithTenantStatusQuery({
    variables: { tenantId },
    skip: !tenantId || !active,
  });

  const [toggleFeature] = useToggleTenantFeatureMutation();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (featureId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await toggleFeature({
        variables: { input: { tenantId, featureId, enabled } },
      });
      await refetchFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (featuresLoading) {
    return <TableSkeleton columnCount={4} rowCount={6} />;
  }

  const features = featuresData?.featuresWithTenantStatus || [];

  return (
    <FeatureList
      features={features}
      tenantId={tenantId}
      onToggle={handleToggle}
      isLoading={isLoading}
    />
  );
}
