'use client';

import {
  useTenantQuery,
  useToggleTenantFeatureMutation,
  useFeaturesWithTenantStatusQuery,
} from '@/generated/graphql';
import * as React from 'react';
import { useI18n } from '@/i18n';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout';
import { FeatureList } from '@/components/features';
import { FeatureFormSheet } from '@/components/features/feature-form-sheet';
import { ContentSkeleton } from '@/components/ui/content-skeleton';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useFeatureEditSheet } from '@/lib/hooks/use-feature-edit-sheet';
import { useToast } from '@/components/ui/toast-provider';
import { extractErrorMessage } from '@/lib/extract-error-message';

export default function TenantFeaturesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  // Only VGREENS_ADMIN can flip feature flags. VGREENS_MEMBER can still see
  // this page (it's linked from the admin nav) but with read-only toggles;
  // the server rejects the mutation for anyone else.
  //
  // We wait for `useMeQuery` to resolve before deciding — otherwise the
  // initial render (with `role` still undefined) would briefly disable the
  // toggles for a legit vGreens admin. Defaulting to `readOnly=false`
  // during load is safe because the mutation is server-gated too.
  const { isVGreensAdmin, loading: userLoading } = useCurrentUser();
  const readOnly = !userLoading && !isVGreensAdmin;

  const { data: tenantData, loading: tenantLoading } = useTenantQuery({
    variables: { id: tenantId },
    skip: !tenantId,
  });

  const {
    data: featuresData,
    loading: featuresLoading,
    refetch: refetchFeatures,
  } = useFeaturesWithTenantStatusQuery({
    variables: { tenantId },
    skip: !tenantId,
  });

  const [toggleFeature] = useToggleTenantFeatureMutation();

  const [isLoading, setIsLoading] = React.useState(false);

  // Pencil "edit feature" state — shared with the tenant tab via the same
  // hook so behavior stays consistent across both entry points.
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
        variables: {
          input: {
            tenantId,
            featureId,
            enabled,
          },
        },
      });
      await refetchFeatures();
    } catch (error) {
      // Surface backend errors (e.g. Forbidden from the @Roles guard) so the
      // user knows why a toggle click didn't take. Otherwise the switch
      // silently reverts and the failure looks like a UI bug.
      console.error('Error toggling feature:', error);
      toast({
        title: t.pages.admin.features.featureAccess ?? 'Feature access',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tenantLoading || featuresLoading) {
    return (
      <div className="space-y-6">
        <ContentSkeleton showHeader lines={0} className="min-h-0 py-0" />
        <TableSkeleton columnCount={4} rowCount={6} />
      </div>
    );
  }

  const tenant = tenantData?.tenant;
  const features = featuresData?.featuresWithTenantStatus || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/tenants')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`${
            t.pages.admin.features.featureAccess || 'Feature Access'
          } - ${tenant?.name || t.pages.admin.tenants.name}`}
          subtitle={
            t.pages.admin.features.manageFeaturesSubtitle ||
            'Manage which features are enabled for this tenant'
          }
        />
      </div>

      <FeatureList
        features={features}
        tenantId={tenantId}
        onToggle={handleToggle}
        isLoading={isLoading}
        readOnly={readOnly}
        onEdit={readOnly ? undefined : editFeature.openEdit}
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
    </div>
  );
}
