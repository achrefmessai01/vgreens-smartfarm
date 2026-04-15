import { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, History } from 'lucide-react-native';
import { useHarvestPage } from '@/lib/hooks/use-harvest-page';
import { useCreateBatchHarvest } from '@/lib/hooks/use-create-batch-harvest';
import { useAppTheme } from '@/lib/theme-preference';
import {
  HarvestDashboardTab,
  HarvestHistoryTab,
  HarvestFormModal,
  HarvestDeleteModal,
} from '@/components/harvest';

type SubTab = 'dashboard' | 'history';

export default function HarvestScreen() {
  const { colors } = useAppTheme();
  const [subTab, setSubTab] = useState<SubTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        segment: {
          flexDirection: 'row',
          marginHorizontal: 16,
          marginTop: 8,
          marginBottom: 4,
          backgroundColor: colors.muted,
          borderRadius: 12,
          padding: 4,
          gap: 4,
        },
        segBtn: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 10,
          borderRadius: 10,
        },
        segActive: { backgroundColor: colors.primary },
        segText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.mutedForeground,
        },
        segTextActive: { color: colors.primaryForeground },
        body: { flex: 1 },
      }),
    [colors],
  );

  const page = useHarvestPage();
  const createBatch = useCreateBatchHarvest(() => {
    page.setCreateOpen(false);
    void page.refetch();
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await page.refetch();
    setRefreshing(false);
  }, [page]);

  const inactiveIcon = colors.mutedForeground;
  const activeIcon = colors.primaryForeground;

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.segment}>
        <Pressable
          style={[styles.segBtn, subTab === 'dashboard' && styles.segActive]}
          onPress={() => setSubTab('dashboard')}
        >
          <BarChart3
            size={16}
            color={subTab === 'dashboard' ? activeIcon : inactiveIcon}
          />
          <Text
            style={[styles.segText, subTab === 'dashboard' && styles.segTextActive]}
          >
            Dashboard
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segBtn, subTab === 'history' && styles.segActive]}
          onPress={() => setSubTab('history')}
        >
          <History
            size={16}
            color={subTab === 'history' ? activeIcon : inactiveIcon}
          />
          <Text
            style={[styles.segText, subTab === 'history' && styles.segTextActive]}
          >
            History
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {subTab === 'dashboard' ? (
          <HarvestDashboardTab />
        ) : (
          <HarvestHistoryTab
            harvests={page.harvests}
            summary={page.summary}
            loading={page.loading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onCreatePress={() => page.setCreateOpen(true)}
            onEdit={page.handleEditRequest}
            onDelete={page.handleDeleteRequest}
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
        onClose={() => {
          createBatch.reset();
          page.setCreateOpen(false);
        }}
        onSubmit={() => void createBatch.submit()}
      />

      <HarvestFormModal
        visible={page.editOpen}
        title="Edit harvest"
        submitLabel="Save changes"
        formData={page.editHarvest.formData}
        setFormData={page.editHarvest.setFormData}
        errors={page.editHarvest.errors}
        loading={page.editHarvest.loading}
        onClose={() => {
          page.setEditOpen(false);
          page.editHarvest.reset();
        }}
        onSubmit={() => void page.editHarvest.submit()}
      />

      <HarvestDeleteModal
        visible={page.deleteOpen}
        loading={page.deleteLoading}
        batchLabel={page.deleteTarget?.batch ?? 'this harvest'}
        onClose={() => page.setDeleteOpen(false)}
        onConfirm={page.handleDeleteConfirm}
      />
    </SafeAreaView>
  );
}
