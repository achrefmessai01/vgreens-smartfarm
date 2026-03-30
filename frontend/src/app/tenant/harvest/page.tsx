'use client';

import { FeatureGuard } from '@/components/features/feature-guard';
import {
  BatchSidebar,
  CreateBatchDialog,
  DeleteHarvestDialog,
  EditHarvestDialog,
  HarvestDashboard,
  HarvestPageHeader,
  HarvestTable,
} from '@/components/harvest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n';
import { useHarvestPage } from '@/lib/hooks/use-harvest-page';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { BarChart3, History } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HarvestPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('tab') || 'dashboard',
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'dashboard' || tabFromUrl === 'history') {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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

  return (
    <FeatureGuard featureKey="harvest_management">
      <div
        className={
          isMobile ? 'flex flex-col sm:px-6' : 'flex h-full min-h-0 flex-col'
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className={
            isMobile
              ? 'flex w-full flex-col'
              : 'flex h-full min-h-0 w-full flex-col'
          }
        >
          <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-full items-center justify-center rounded-lg p-1">
            <TabsTrigger
              value="dashboard"
              className="flex flex-1 items-center justify-center gap-2 px-3 py-1 sm:px-4"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {t.navigation?.dashboard || 'Dashboard'}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex flex-1 items-center justify-center gap-2 px-3 py-1 sm:px-4"
            >
              <History className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {t.navigation?.history || 'History'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dashboard"
            className="mt-4 min-h-0 flex-1 sm:mt-6"
          >
            <HarvestDashboard />
          </TabsContent>

          <TabsContent
            value="history"
            className={
              isMobile
                ? 'mt-4 flex flex-col sm:mt-6'
                : 'mt-6 flex min-h-0 flex-1 flex-col'
            }
          >
            <div
              className={
                isMobile
                  ? 'flex flex-col gap-4 sm:gap-6'
                  : 'flex h-full min-h-0 flex-col gap-6'
              }
            >
              <HarvestPageHeader
                summary={summary}
                title={t.pages.harvest?.historyTitle || 'Harvest History'}
                onCreateBatch={handleCreateBatch}
              />
              <HarvestTable
                harvests={harvests ?? []}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
                onSidebarEdit={handleSidebarEdit}
                isLoading={loading}
              />
            </div>
          </TabsContent>
        </Tabs>

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
        />
      </div>
    </FeatureGuard>
  );
}
