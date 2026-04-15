import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Bell, AlertTriangle } from 'lucide-react-native';
import type { Alert } from '@/generated/graphql';
import type { AlertsFilterInput } from '@/lib/alerts-filter';
import { AlertCard } from './alert-card';
import { AlertStatusFilter } from './alert-status-filter';

interface AlertsFeedProps {
  alerts: Alert[];
  filter: AlertsFilterInput;
  error: Error | undefined;
  openAlertsCount: number;
  refreshing: boolean;
  colors: {
    primary: string;
    destructive: string;
    mutedForeground: string;
  };
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
  colors,
  onFilterChange,
  onSelect,
  onRefresh,
  onRetry,
}: AlertsFeedProps) {
  return (
    <View className="flex-1 px-4 pt-4">
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-bold text-foreground">Alerts</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            Sensor alerts for your farm
          </Text>
        </View>
        {openAlertsCount > 0 && (
          <View className="flex-row items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1">
            <AlertTriangle size={14} color={colors.destructive} />
            <Text className="text-xs font-bold text-destructive">
              {openAlertsCount} open
            </Text>
          </View>
        )}
      </View>

      <AlertStatusFilter filter={filter} onChange={onFilterChange} />

      {error ? (
        <View className="flex-1 items-center justify-center gap-3 px-4 pb-16">
          <Text className="text-center text-sm text-destructive">
            {error.message}
          </Text>
          <Pressable onPress={onRetry}>
            <Text className="text-center text-sm font-semibold text-primary">
              Tap to retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onPress={onSelect} />
          )}
          contentContainerClassName="gap-3 pb-8"
          ListEmptyComponent={
            <View className="items-center gap-3 py-16">
              <Bell size={40} color={colors.mutedForeground} />
              <Text className="text-base font-semibold text-foreground">
                No alerts
              </Text>
              <Text className="max-w-[260px] text-center text-sm text-muted-foreground">
                Alerts from your sensors will show here when they are raised.
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
