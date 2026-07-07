'use client';

import * as React from 'react';
import {
  type Feature,
  type FeatureWithTenantStatus,
  useUpdateFeatureMutation,
} from '@/generated/graphql';
import type { FeatureFormData } from '@/components/features/feature-form';

interface UseFeatureEditSheetOptions {
  // Called after a successful update so the parent can refresh whatever
  // query drove the feature list (e.g. `refetchFeatures`).
  onUpdated?: () => Promise<unknown> | void;
  // Optional error hook. The tenant-scoped views hoist this to a toast so a
  // silent backend rejection (e.g. Forbidden from @Roles) becomes visible.
  onError?: (error: unknown) => void;
}

// Shared state + mutation glue for the "edit feature" pencil action on the
// Feature Access panel. The full-blown feature-flags admin page has its own
// `useFeatureManagement` (which also handles create + delete); this hook is
// the trimmed-down "edit only" variant used by:
//   - /admin/tenants/[tenantId]/features (standalone page)
//   - the Features tab inside the tenant detail dialog
//
// Both call sites need the same wiring: open the sheet on a FeatureWithTenantStatus
// row, run the mutation, refetch the list, then close.
export function useFeatureEditSheet({
  onUpdated,
  onError,
}: UseFeatureEditSheetOptions = {}) {
  const [updateFeature] = useUpdateFeatureMutation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingFeature, setEditingFeature] = React.useState<Feature | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const openEdit = React.useCallback((feature: FeatureWithTenantStatus) => {
    // FeatureFormSheet expects a `Feature`; FeatureWithTenantStatus carries
    // every field we need for prefill, so widen it in place. `tenantFeatures`
    // isn't read by the form, so leaving it undefined is safe.
    const asFeature: Feature = {
      __typename: 'Feature',
      id: feature.id,
      key: feature.key,
      name: feature.name,
      description: feature.description,
      category: feature.category,
      isActive: feature.isActive,
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
    setEditingFeature(asFeature);
    setIsSheetOpen(true);
  }, []);

  const handleSheetClose = React.useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingFeature(null);
    }
  }, []);

  const handleSubmit = React.useCallback(
    async (formData: FeatureFormData) => {
      if (!editingFeature) return;
      setIsLoading(true);
      try {
        await updateFeature({
          variables: {
            id: editingFeature.id,
            input: {
              id: editingFeature.id,
              ...formData,
            },
          },
        });
        await onUpdated?.();
        setIsSheetOpen(false);
        setEditingFeature(null);
      } catch (error) {
        // Server enforces @Roles(VGREENS_ADMIN); surface the failure so a
        // non-admin who somehow reached the pencil (or a stale UI state)
        // doesn't watch the sheet close on a silent no-op.
        console.error('Error updating feature:', error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingFeature, updateFeature, onUpdated, onError],
  );

  return {
    editingFeature,
    isSheetOpen,
    isLoading,
    openEdit,
    handleSheetClose,
    handleSubmit,
  };
}
