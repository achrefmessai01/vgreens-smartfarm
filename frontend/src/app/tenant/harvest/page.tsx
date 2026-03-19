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
import { useDashboardData } from '@/components/harvest/dashboard/use-dashboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n';
import { useHarvestDashboard } from '@/lib/hooks/use-harvest-dashboard';
import { BarChart3, History } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHarvestPage } from './use-harvest-page';

// Toggle this flag to switch between mock and real data
const USE_REAL_DATA = true;

export default function HarvestPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial tab from URL parameter, default to dashboard
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const mockData = useDashboardData();
  const {
    data: realData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useHarvestDashboard();
  const dashboardData = USE_REAL_DATA ? realData : mockData;

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Initialize tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (
      tabFromUrl &&
      (tabFromUrl === 'dashboard' || tabFromUrl === 'history')
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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
      <div className="flex flex-col h-full min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full flex flex-col h-full min-h-0"
        >
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 px-4 py-1"
            >
              <BarChart3 className="h-4 w-4" />
              {t.navigation?.dashboard || 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 px-4 py-1"
            >
              <History className="h-4 w-4" />
              {t.navigation?.history || 'History'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 flex-1 min-h-0">
            <HarvestDashboard />
          </TabsContent>

          <TabsContent
            value="history"
            className="mt-6 flex-1 min-h-0 flex flex-col"
          >
            <div className="flex flex-col gap-6 h-full min-h-0">
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
