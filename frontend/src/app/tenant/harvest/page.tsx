'use client';

import {
  HarvestTable,
  BatchSidebar,
  HarvestDetails,
  HarvestPageHeader,
  CreateBatchDialog,
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
    selectedHarvest,
    detailsOpen,
    setDetailsOpen,
    createBatchOpen,
    setCreateBatchOpen,
    batchSidebarOpen,
    setBatchSidebarOpen,
    pendingBatch,
    handleViewDetails,
    handleCreateBatch,
    handleBatchCreated,
    handleSidebarCompleted,
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
          harvests={harvests}
          onViewDetails={handleViewDetails}
          isLoading={loading}
        />

        <HarvestDetails
          harvest={selectedHarvest}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />

        <CreateBatchDialog
          open={createBatchOpen}
          onOpenChange={setCreateBatchOpen}
          onCreated={handleBatchCreated}
        />

        <BatchSidebar
          open={batchSidebarOpen}
          onOpenChange={setBatchSidebarOpen}
          harvestId={pendingBatch?.id ?? null}
          batchData={pendingBatch?.details ?? null}
          onCompleted={handleSidebarCompleted}
          onPhotoUpload={(files) => {
            console.log('Upload photos:', files);
          }}
        />
      </div>
    </FeatureGuard>
  );
}
