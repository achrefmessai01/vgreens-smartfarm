import { useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme-preference';
import { useAlertsPage } from '@/lib/hooks/use-alerts-page';
import {
  AlertsFeed,
  AlertDetailModal,
  AlertActionModal,
  AlertDeleteModal,
} from '@/components/alerts';

export default function AlertsScreen() {
  const { colors } = useAppTheme();
  const page = useAlertsPage();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await page.refetch();
    setRefreshing(false);
  }, [page]);

  const deleteLabel =
    page.deleteConfirmation.alert?.field?.trim() ||
    page.deleteConfirmation.alert?.sensorName ||
    'this alert';

  const screenStyle = { flex: 1, backgroundColor: colors.background };

  if (page.loading && page.alerts.length === 0 && !page.error) {
    return (
      <SafeAreaView style={screenStyle} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <AlertsFeed
        alerts={page.alerts}
        filter={page.filter}
        error={page.error}
        openAlertsCount={page.openAlertsCount}
        refreshing={refreshing}
        onFilterChange={page.onFilterChange}
        onSelect={(a) => page.setSelectedAlert(a)}
        onRefresh={onRefresh}
        onRetry={() => void page.refetch()}
      />

      <AlertDetailModal
        visible={page.selectedAlert !== null}
        alert={page.selectedAlert}
        loading={page.isLoading}
        onClose={() => page.setSelectedAlert(null)}
        onAcknowledge={(a) => {
          page.setSelectedAlert(null);
          page.onAcknowledge(a);
        }}
        onResolve={(a) => {
          page.setSelectedAlert(null);
          page.onResolve(a);
        }}
        onDelete={(a) => {
          page.setSelectedAlert(null);
          page.onDelete(a);
        }}
      />

      <AlertActionModal
        visible={page.actionDialog.isOpen}
        loading={page.isLoading}
        action={page.actionDialog.action}
        onConfirm={() => void page.confirmAction()}
        onCancel={() =>
          page.setActionDialog({
            isOpen: false,
            alert: null,
            action: null,
          })
        }
      />

      <AlertDeleteModal
        visible={page.deleteConfirmation.isOpen}
        loading={page.isLoading}
        label={deleteLabel}
        onClose={() =>
          page.setDeleteConfirmation({ alert: null, isOpen: false })
        }
        onConfirm={() => void page.confirmDelete()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
