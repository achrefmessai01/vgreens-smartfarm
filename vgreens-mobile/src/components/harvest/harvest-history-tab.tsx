import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Plus, ClipboardList } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import type { HarvestSummary } from '@/types/harvest';
import { useAppTheme } from '@/lib/theme-preference';
import { createHarvestHistoryStyles } from './harvest-history-tab.styles';
import { HarvestItemCard } from './harvest-item-card';

interface HarvestHistoryTabProps {
  harvests: HarvestItem[] | undefined;
  summary: HarvestSummary;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCreatePress: () => void;
  onEdit: (h: HarvestItem) => void;
  onDelete: (h: HarvestItem) => void;
}

export function HarvestHistoryTab({
  harvests,
  summary,
  loading,
  refreshing,
  onRefresh,
  onCreatePress,
  onEdit,
  onDelete,
}: HarvestHistoryTabProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () => createHarvestHistoryStyles(colors),
    [colors],
  );

  const list = harvests ?? [];

  if (loading && list.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading harvests…</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.head}>
        <View>
          <Text style={styles.h1}>Harvest history</Text>
          <Text style={styles.sub}>
            {summary.totalHarvests} harvests logged · Top batch: {summary.variety}
          </Text>
        </View>
        <Pressable style={styles.createBtn} onPress={onCreatePress}>
          <Plus size={18} color="#fff" />
          <Text style={styles.createText}>New batch</Text>
        </Pressable>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ClipboardList size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>No harvests yet</Text>
            <Text style={styles.emptySub}>
              Create a batch to start logging yields.
            </Text>
            <Pressable style={styles.createBtn2} onPress={onCreatePress}>
              <Text style={styles.createText}>Create batch</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <HarvestItemCard
            harvest={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        )}
      />
    </View>
  );
}
