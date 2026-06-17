'use client';

import { FeatureGuard } from '@/components/features/feature-guard';
import {
  BatchSidebar,
  CreateBatchDialog,
  DeleteHarvestDialog,
  EditHarvestDialog,
  HarvestDashboard,
  HarvestExportDialog,
  HarvestPageHeader,
  HarvestTable,
  PeriodFilter,
  SortControls,
} from '@/components/harvest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n';
import { useHarvestPage } from '@/lib/hooks/use-harvest-page';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { BarChart3, History } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function HarvestPage() {
  const { t } = useI18n();
  const { isMobile } = useResponsiveBreakpoint('lg');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get('tab') === 'history' ? 'history' : 'dashboard';

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const {
    harvests,
    batches,
    summary,
    loading,
    view,
    isFiltered,
    handleSortChange,
    handleRangeChange,
    handleToggleCollapse,
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
    handleSidebarView,
    handleLogEntry,
    handleBatchView,
    handleBatchEdit,
    editOpen,
    setEditOpen,
    editReadOnly,
    editBatchNumber,
    editHarvest,
    deleteOpen,
    setDeleteOpen,
    deleteLoading,
    handleDeleteConfirm,
    handleDeleteRequest,
    handleBatchDeleteRequest,
    isBatchDelete,
  } = useHarvestPage();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <FeatureGuard featureKey="harvest_management">
      <div
        className={
          isMobile
            ? 'flex w-full min-w-0 flex-col sm:px-6'
            : 'flex h-full min-h-0 w-full min-w-0 flex-col'
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className={
            isMobile
              ? 'flex w-full min-w-0 flex-col'
              : 'flex h-full min-h-0 w-full min-w-0 flex-col'
          }
        >
          <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-full items-center justify-center rounded-lg p-1 lg:h-auto lg:w-auto lg:min-w-0 lg:justify-start lg:gap-3 lg:bg-transparent lg:p-0">
            <TabsTrigger
              value="dashboard"
              className="lg:border-border/60 lg:bg-background/80 lg:text-foreground/70 lg:hover:border-border lg:hover:bg-background lg:hover:text-foreground flex flex-1 items-center justify-center gap-2 px-3 py-1 sm:px-4 lg:h-11 lg:min-w-[11rem] lg:flex-none lg:justify-start lg:gap-3 lg:rounded-xl lg:border lg:px-5 lg:text-sm lg:font-semibold lg:shadow-sm lg:backdrop-blur-sm lg:transition-all lg:after:hidden lg:hover:-translate-y-0.5 lg:data-[state=active]:border-emerald-500/30 lg:data-[state=active]:bg-emerald-500/10 lg:data-[state=active]:text-emerald-950 lg:data-[state=active]:shadow-[0_14px_30px_-18px_rgba(16,185,129,0.9)] dark:lg:data-[state=active]:text-emerald-100"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {t.navigation?.dashboard || 'Dashboard'}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="lg:border-border/60 lg:bg-background/80 lg:text-foreground/70 lg:hover:border-border lg:hover:bg-background lg:hover:text-foreground flex flex-1 items-center justify-center gap-2 px-3 py-1 sm:px-4 lg:h-11 lg:min-w-[11rem] lg:flex-none lg:justify-start lg:gap-3 lg:rounded-xl lg:border lg:px-5 lg:text-sm lg:font-semibold lg:shadow-sm lg:backdrop-blur-sm lg:transition-all lg:after:hidden lg:hover:-translate-y-0.5 lg:data-[state=active]:border-emerald-500/30 lg:data-[state=active]:bg-emerald-500/10 lg:data-[state=active]:text-emerald-950 lg:data-[state=active]:shadow-[0_14px_30px_-18px_rgba(16,185,129,0.9)] dark:lg:data-[state=active]:text-emerald-100"
            >
              <History className="h-4 w-4" />
              <span className="text-xs sm:text-sm">
                {t.pages.harvest?.harvestEntryTab || 'Harvest Entry'}
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
                ? 'mt-4 flex min-w-0 flex-col sm:mt-6'
                : 'mt-6 flex min-h-0 min-w-0 flex-1 flex-col'
            }
          >
            <div
              className={
                isMobile
                  ? 'flex min-w-0 flex-col gap-4 sm:gap-6'
                  : 'flex h-full min-h-0 min-w-0 flex-col gap-6'
              }
            >
              <HarvestPageHeader
                summary={summary}
                title={t.pages.harvest?.harvestEntryTitle || 'Harvest Entry'}
                onCreateBatch={handleCreateBatch}
                onExportClick={() => setExportDialogOpen(true)}
                filters={
                  <>
                    <PeriodFilter
                      value={view.range}
                      onChange={handleRangeChange}
                    />
                    <SortControls
                      value={view.sort}
                      onChange={handleSortChange}
                    />
                  </>
                }
              />
              <HarvestTable
                batches={batches ?? []}
                harvests={harvests ?? []}
                onDelete={handleDeleteRequest}
                onSidebarEdit={handleSidebarEdit}
                onSidebarView={handleSidebarView}
                onLogEntry={handleLogEntry}
                onViewBatch={handleBatchView}
                onEditBatch={handleBatchEdit}
                onDeleteBatch={handleBatchDeleteRequest}
                isLoading={loading}
                isFiltered={isFiltered}
                collapsedBatchIds={view.collapsedBatchIds}
                onToggleCollapse={handleToggleCollapse}
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
          readOnly={editReadOnly}
          batchNumber={editBatchNumber}
        />

        <DeleteHarvestDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
          title={
            isBatchDelete
              ? (t.pages.harvest?.deleteBatch ?? 'Delete Batch')
              : undefined
          }
          description={
            isBatchDelete
              ? (t.pages.harvest?.deleteBatchDescription ??
                'Are you sure you want to delete this batch and all linked harvest entries? This action cannot be undone.')
              : undefined
          }
        />

        <BatchSidebar
          open={batchSidebarOpen}
          onOpenChange={setBatchSidebarOpen}
          batchId={pendingBatch?.batchId ?? null}
          harvestId={pendingBatch?.harvestId ?? null}
          batchData={pendingBatch?.details ?? null}
          mode={sidebarMode}
          initialDate={pendingBatch?.initialDate ?? null}
          onCompleted={handleSidebarCompleted}
        />

        <HarvestExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
        />
      </div>
    </FeatureGuard>
  );
}
