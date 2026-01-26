'use client'

import { useI18n } from '@/i18n'
import { Flag } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { FeatureTable } from '@/components/features'
import { Card, CardContent } from '@/components/ui/card'
import { useFeatureManagement } from '@/lib/hooks/use-feature-management'
import { FeatureFormSheet } from '@/components/features/feature-form-sheet'
import { FeatureDeleteDialog } from '@/components/features/feature-delete-dialog'
import { FeatureFlagsPageSkeleton } from '@/components/features/feature-flags-page-skeleton'

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

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <FeatureTable
            features={features}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

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
