'use client';

import {
  HarvestTable,
  BatchSidebar,
  HarvestPageHeader,
  CreateBatchDialog,
  EditHarvestDialog,
  DeleteHarvestDialog,
  HarvestPageSkeleton,
} from '@/components/harvest';
import { useI18n } from '@/i18n';
import { useHarvestPage } from './use-harvest-page';
import { FeatureGuard } from '@/components/features/feature-guard';

export default function HarvestPage() {
  const { t } = useI18n();
  const {
    harvests,
    summary,
    loading,
    createBatchOpen,
    setCreateBatchOpen,
    batchSidebarOpen,
    setBatchSidebarOpen,
    sidebarMode,
    pendingBatch,
    handleCreateBatch,
    handleBatchCreated,
    handleSidebarCompleted,
    handleSidebarEdit,
    editOpen,
    setEditOpen,
    editHarvest,
    handleEditRequest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    handleDeleteConfirm,
    handleDeleteRequest,
  } = useHarvestPage();

  if (loading && (harvests?.length ?? 0) === 0) {
    return (
      <FeatureGuard
        featureKey="harvest_management"
        skeleton={<HarvestPageSkeleton />}
      >
        <HarvestPageSkeleton />
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard featureKey="harvest_management">
      <div className="space-y-6">
        <HarvestPageHeader
          summary={summary}
          title={t.pages.harvest?.title || 'Harvest History'}
          onCreateBatch={handleCreateBatch}
        />

        <HarvestTable
          harvests={harvests ?? []}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          onSidebarEdit={handleSidebarEdit}
          isLoading={loading}
        />

        <CreateBatchDialog
          open={createBatchOpen}
          onOpenChange={setCreateBatchOpen}
          onCreated={handleBatchCreated}
        />

        <EditHarvestDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          formData={editHarvest.formData}
          setFormData={editHarvest.setFormData}
          errors={editHarvest.errors}
          loading={editHarvest.loading}
          onSubmit={editHarvest.handleSubmit}
          onReset={editHarvest.reset}
        />

        <DeleteHarvestDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />

        <BatchSidebar
          open={batchSidebarOpen}
          onOpenChange={setBatchSidebarOpen}
          harvestId={pendingBatch?.id ?? null}
          batchData={pendingBatch?.details ?? null}
          mode={sidebarMode}
          onCompleted={handleSidebarCompleted}
          onPhotoUpload={(files) => {
            console.log('Upload photos:', files);
          }}
        />
      </div>
    </FeatureGuard>
  );
}
