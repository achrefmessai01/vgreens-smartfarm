import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { AlertTriangle, BellOff, RefreshCw } from 'lucide-react-native';
import type { Alert } from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { useAppTheme } from '@/lib/theme-preference';
import { AlertCard } from './alert-card';
import { AlertStatusFilter } from './alert-status-filter';
import { createAlertsFeedStyles } from './alerts-feed.styles';

interface AlertsFeedProps {
  alerts: Alert[];
  filter: AlertsFilterInput;
  error: Error | undefined;
  openAlertsCount: number;
  refreshing: boolean;
  onFilterChange: (u: Partial<AlertsFilterInput>) => void;
  onSelect: (a: Alert) => void;
  onRefresh: () => void;
  onRetry: () => void;
}

export function AlertsFeed({
  alerts,
  filter,
  error,
  openAlertsCount,
  refreshing,
  onFilterChange,
  onSelect,
  onRefresh,
  onRetry,
}: AlertsFeedProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createAlertsFeedStyles(colors), [colors]);

  return (
    <View style={styles.flex}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.h1} numberOfLines={1}>
            Alerts
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            Sensor alerts for your farm
          </Text>
        </View>
        {openAlertsCount > 0 ? (
          <View style={styles.openChip}>
            <AlertTriangle size={13} color="#ef4444" />
            <Text style={styles.openText}>{openAlertsCount} open</Text>
          </View>
        ) : null}
      </View>

      <AlertStatusFilter filter={filter} onChange={onFilterChange} />

      {error ? (
        <View style={styles.errorBox}>
          <AlertTriangle size={28} color={colors.destructive} />
          <Text style={styles.errorText}>{error.message}</Text>
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <RefreshCw size={14} color={colors.primaryForeground} />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onPress={onSelect} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <BellOff size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No alerts</Text>
              <Text style={styles.emptySub}>
                Alerts from your sensors will show up here.
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
