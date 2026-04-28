import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BatchSheet,
  HarvestDashboardTab,
  HarvestDeleteModal,
  HarvestEntryTab,
  HarvestFormModal,
  HarvestTabSwitch,
  type HarvestSubTab,
} from '@/components/harvest';
import { useCreateBatchHarvest } from '@/lib/hooks/use-create-batch-harvest';
import { useHarvestPage } from '@/lib/hooks/use-harvest-page';
import { useAppTheme } from '@/lib/theme-preference';

export default function HarvestScreen() {
  const { colors } = useAppTheme();
  const [subTab, setSubTab] = useState<HarvestSubTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        body: { flex: 1 },
      }),
    [colors],
  );

  const page = useHarvestPage();

  const createBatch = useCreateBatchHarvest((harvest) => {
    page.setCreateOpen(false);
    page.handleBatchCreated(harvest);
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await page.refetch();
    setRefreshing(false);
  }, [page]);

  const handleCreateClose = useCallback(() => {
    createBatch.reset();
    page.setCreateOpen(false);
  }, [createBatch, page]);

  const handleEditClose = useCallback(() => {
    page.setEditOpen(false);
    page.editHarvest.reset();
  }, [page]);

  const deleteLabel = page.isBatchDelete
    ? 'this batch and all entries'
    : (page.deleteTarget?.batch ?? 'this harvest');
  const deleteTitle = page.isBatchDelete ? 'Delete batch?' : 'Delete harvest?';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <HarvestTabSwitch value={subTab} onChange={setSubTab} />

      <View style={styles.body}>
        {subTab === 'dashboard' ? (
          <HarvestDashboardTab />
        ) : (
          <HarvestEntryTab
            harvests={page.harvests}
            summary={page.summary}
            loading={page.loading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onCreatePress={() => page.setCreateOpen(true)}
            onEditBatch={page.handleBatchEdit}
            onDeleteBatch={page.handleBatchDeleteRequest}
            onLogEntry={page.handleLogEntry}
            onEditEntry={page.handleCompleteRequest}
            onDeleteEntry={page.handleDeleteRequest}
          />
        )}
      </View>

      <HarvestFormModal
        visible={page.createOpen}
        title="Create batch"
        submitLabel="Create batch"
        formData={createBatch.formData}
        setFormData={createBatch.setFormData}
        errors={createBatch.errors}
        loading={createBatch.loading}
        onClose={handleCreateClose}
        onSubmit={() => void createBatch.submit()}
      />

      <HarvestFormModal
        visible={page.editOpen}
        title={page.editReadOnly ? 'Batch details' : 'Edit batch'}
        submitLabel="Save changes"
        formData={page.editHarvest.formData}
        setFormData={page.editHarvest.setFormData}
        errors={page.editHarvest.errors}
        loading={page.editHarvest.loading}
        readOnly={page.editReadOnly}
        onClose={handleEditClose}
        onSubmit={() => void page.editHarvest.submit()}
      />

      <HarvestDeleteModal
        visible={page.deleteOpen}
        loading={page.deleteLoading}
        title={deleteTitle}
        batchLabel={deleteLabel}
        onClose={() => page.setDeleteOpen(false)}
        onConfirm={page.handleDeleteConfirm}
      />

      <BatchSheet
        visible={page.sheetOpen}
        harvestId={page.pendingBatch?.id ?? null}
        batchData={page.pendingBatch?.details ?? null}
        mode={page.sheetMode}
        onClose={page.handleSheetClose}
        onCompleted={page.handleSheetCompleted}
      />
    </SafeAreaView>
  );
}
