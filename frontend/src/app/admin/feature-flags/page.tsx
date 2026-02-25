'use client'

import { FeatureTable } from '@/components/features'
import { FeatureDeleteDialog } from '@/components/features/feature-delete-dialog'
import { FeatureFlagsPageSkeleton } from '@/components/features/feature-flags-page-skeleton'
import { FeatureFormSheet } from '@/components/features/feature-form-sheet'
import { PageHeader } from '@/components/layout'
import { useI18n } from '@/i18n'
import { useFeatureManagement } from '@/lib/hooks/use-feature-management'
import { Flag } from 'lucide-react'

export default function FeatureFlagsPage() {
  const { t } = useI18n()
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
  } = useFeatureManagement()

  if (loading) {
    return <FeatureFlagsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Flag className="h-5 w-5 text-primary" />
        </div>
        <PageHeader
          title={t.pages.admin.features.title}
          subtitle={t.pages.admin.features.subtitle}
        />
      </div>

      <FeatureTable
        features={features}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
      />

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
  )
}
