'use client';

import {
  useSetTenantDeviceStatusForTenantAdminsMutation,
  useTenantQuery,
  useToggleTenantFeatureMutation,
  useFeaturesWithTenantStatusQuery,
} from '@/generated/graphql';
import * as React from 'react';
import { FeatureList } from '@/components/features';
import { FeatureFormSheet } from '@/components/features/feature-form-sheet';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useFeatureEditSheet } from '@/lib/hooks/use-feature-edit-sheet';
import { extractErrorMessage } from '@/lib/extract-error-message';

interface TenantFeaturesTabProps {
  tenantId: string;
  active: boolean;
}

export function TenantFeaturesTab({
  tenantId,
  active,
}: TenantFeaturesTabProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  // Feature access is a vGreens-admin-only concern. VGREENS_MEMBER can still
  // open this tab (read-only across the app) but can't toggle. The server
  // enforces the same role on the toggle mutation.
  //
  // We wait for `useMeQuery` to resolve before deciding — otherwise the
  // initial render (with `role` still undefined) would briefly disable the
  // toggles for a legit vGreens admin. Defaulting to `readOnly=false`
  // during load is safe because the mutation is server-gated too.
  const { isVGreensAdmin, loading: userLoading } = useCurrentUser();
  const readOnly = !userLoading && !isVGreensAdmin;

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

  // Device-status availability for the tenant's TENANT_ADMINs. Lives in
  // tenant.settings (not the feature-flag table) because it scopes WHO within
  // the tenant sees the dashboard, not whether the tenant has the feature.
  const { data: tenantData } = useTenantQuery({
    variables: { id: tenantId },
    skip: !tenantId || !active,
    fetchPolicy: 'cache-and-network',
  });
  const deviceStatusForTenantAdmins =
    tenantData?.tenant?.settings?.deviceStatusForTenantAdmins ?? false;
  const [setDeviceStatusForTenantAdmins, { loading: settingSaving }] =
    useSetTenantDeviceStatusForTenantAdminsMutation();

  const handleDeviceStatusToggle = async (enabled: boolean) => {
    try {
      // Mutation payload returns tenant.id + settings, so the Apollo cache
      // entry behind useTenantQuery updates without a refetch.
      await setDeviceStatusForTenantAdmins({
        variables: { tenantId, enabled },
      });
    } catch (error) {
      toast({
        title: t.pages.admin.features.featureAccess ?? 'Feature access',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  // Pencil-icon "edit feature" flow — surfaces the same
  // FeatureFormSheet used on the standalone feature-flags admin page. The
  // sheet is only mounted when the user isn't in read-only mode, so
  // VGREENS_MEMBER + tenant users never see it. The hook falls back to a
  // toast on failure to keep parity with the toggle path above.
  const editFeature = useFeatureEditSheet({
    onUpdated: () => refetchFeatures(),
    onError: (error) => {
      toast({
        title: t.pages.admin.features.editFeature ?? 'Edit feature',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleToggle = async (featureId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await toggleFeature({
        variables: { input: { tenantId, featureId, enabled } },
      });
      await refetchFeatures();
    } catch (error) {
      // Surface backend errors (e.g. Forbidden from the @Roles guard) so the
      // user knows why a toggle click didn't take. Otherwise the switch
      // silently reverts and the failure looks like a UI bug.
      console.error('Error toggling feature:', error);
      toast({
        title:
          t.pages.admin.features.featureAccess ?? 'Feature access',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (featuresLoading) {
    return <TableSkeleton columnCount={4} rowCount={6} />;
  }

  const features = featuresData?.featuresWithTenantStatus || [];

  return (
    <>
      <FeatureList
        features={features}
        tenantId={tenantId}
        onToggle={handleToggle}
        isLoading={isLoading}
        readOnly={readOnly}
        onEdit={readOnly ? undefined : editFeature.openEdit}
        // Role-scoped access sub-toggle inside the device_status card: the
        // flag decides whether the tenant HAS device status, this decides
        // whether the tenant's own admins may open it. Title/description keys
        // live in en.ts only for now — other locales fall back to English via
        // the i18n deepFallback merge.
        getSubToggle={(feature) =>
          feature.key === 'device_status'
            ? {
                title: t.pages.admin.features.deviceStatusForTenantAdminsTitle,
                description:
                  t.pages.admin.features
                    .deviceStatusForTenantAdminsDescription,
                checked: deviceStatusForTenantAdmins,
                onChange: handleDeviceStatusToggle,
                loading: settingSaving,
              }
            : undefined
        }
      />
      {!readOnly && (
        <FeatureFormSheet
          open={editFeature.isSheetOpen}
          onOpenChange={editFeature.handleSheetClose}
          feature={editFeature.editingFeature}
          onSubmit={editFeature.handleSubmit}
          isLoading={editFeature.isLoading}
        />
      )}
    </>
  );
}
