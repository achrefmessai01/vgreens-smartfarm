'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  HarvestTable,
  BatchSidebar,
  HarvestPageHeader,
  CreateBatchDialog,
  EditHarvestDialog,
  DeleteHarvestDialog,
  HarvestDashboard,
} from '@/components/harvest';
import { useI18n } from '@/i18n';
import { useHarvestPage } from '@/lib/hooks/use-harvest-page';
import { FeatureGuard } from '@/components/features/feature-guard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, History } from 'lucide-react';

export default function HarvestPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'dashboard');

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
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-1">
              <BarChart3 className="h-4 w-4" />
              {t.navigation?.dashboard || 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 px-4 py-1">
              <History className="h-4 w-4" />
              {t.navigation?.history || 'History'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <HarvestDashboard />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-6">
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
