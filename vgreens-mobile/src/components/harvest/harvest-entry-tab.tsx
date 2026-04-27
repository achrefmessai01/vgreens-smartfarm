import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { ClipboardList, Plus } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import type { HarvestSummary } from '@/types/harvest';
import { groupByBatch, type BatchGroup } from '@/lib/harvest-grouping';
import { useAppTheme } from '@/lib/theme-preference';
import { createHarvestHistoryStyles } from './harvest-history-tab.styles';
import { HarvestBatchGroup } from './harvest-batch-group';

interface HarvestEntryTabProps {
  harvests: HarvestItem[] | undefined;
  summary: HarvestSummary;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onCreatePress: () => void;
  onEditBatch: (batch: HarvestItem) => void;
  onDeleteBatch: (batch: HarvestItem, entries: HarvestItem[]) => void;
  onLogEntry: (batch: HarvestItem) => void;
  onEditEntry: (entry: HarvestItem) => void;
  onDeleteEntry: (entry: HarvestItem) => void;
}

export function HarvestEntryTab({
  harvests,
  summary,
  loading,
  refreshing,
  onRefresh,
  onCreatePress,
  onEditBatch,
  onDeleteBatch,
  onLogEntry,
  onEditEntry,
  onDeleteEntry,
}: HarvestEntryTabProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createHarvestHistoryStyles(colors), [colors]);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [openBatches, setOpenBatches] = useState<Record<string, boolean>>({});

  const groups = useMemo<BatchGroup<HarvestItem>[]>(
    () => groupByBatch(harvests ?? []),
    [harvests],
  );

  const handleToggleReveal = useCallback(
    (id: string) => setRevealedId((prev) => (prev === id ? null : id)),
    [],
  );

  const handleToggleOpen = useCallback(
    (key: string) =>
      setOpenBatches((prev) => ({ ...prev, [key]: prev[key] === false })),
    [],
  );

  if (loading && groups.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading harvest entries…</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.h1} numberOfLines={1}>
            Harvest Entry
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {summary.totalHarvests} harvests · {groups.length} batches ·{' '}
            {summary.totalClassA}kg total
          </Text>
        </View>
        <Pressable
          style={styles.createBtn}
          onPress={onCreatePress}
          accessibilityLabel="Create batch"
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.createText}>New</Text>
        </Pressable>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.key}
        contentContainerStyle={styles.list}
        onScrollBeginDrag={() => setRevealedId(null)}
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
            <Text style={styles.emptyTitle}>No batches yet</Text>
            <Text style={styles.emptySub}>
              Create a batch to start logging harvest entries.
            </Text>
            <Pressable style={styles.createBtn2} onPress={onCreatePress}>
              <Text style={styles.createText}>Create batch</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <HarvestBatchGroup
            group={item}
            open={openBatches[item.key] !== false}
            onToggleOpen={() => handleToggleOpen(item.key)}
            revealedId={revealedId}
            onToggleReveal={handleToggleReveal}
            onEditBatch={onEditBatch}
            onDeleteBatch={onDeleteBatch}
            onLogEntry={onLogEntry}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
        )}
      />
    </View>
  );
}
