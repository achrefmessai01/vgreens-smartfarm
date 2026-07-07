'use client';

import { FeatureTable } from '@/components/features';
import { FeatureDeleteDialog } from '@/components/features/feature-delete-dialog';
import { FeatureFlagsPageSkeleton } from '@/components/features/feature-flags-page-skeleton';
import { FeatureFormSheet } from '@/components/features/feature-form-sheet';
import { PageHeader } from '@/components/layout';
import { useI18n } from '@/i18n';
import { useFeatureManagement } from '@/lib/hooks/use-feature-management';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';

export default function FeatureFlagsPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const {
    features,
    loading,
    isLoading,
    editingFeature,
    isSheetOpen,
    deleteConfirmation,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleDeleteConfirm,
    handleSheetClose,
    handleDeleteDialogClose,
  } = useFeatureManagement();

  if (loading) {
    return <FeatureFlagsPageSkeleton />;
  }

  return (
    <div
      className={
        isMobile ? 'flex flex-col gap-6' : 'flex h-full min-h-0 flex-col gap-6'
      }
    >
      <PageHeader
        title={t.pages.admin.features.title}
        subtitle={t.pages.admin.features.subtitle}
      />

      <div className={isMobile ? '' : 'min-h-0 flex-1'}>
        <FeatureTable
          features={features}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          isLoading={isLoading}
        />
      </div>

      <FeatureFormSheet
        open={isSheetOpen}
        onOpenChange={handleSheetClose}
        feature={editingFeature}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <FeatureDeleteDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={handleDeleteDialogClose}
        feature={deleteConfirmation.feature}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
