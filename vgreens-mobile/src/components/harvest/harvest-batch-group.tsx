import { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import {
  isAutoDraftPlaceholder,
  type BatchGroup,
} from '@/lib/harvest-grouping';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestBatchSummary } from './harvest-batch-summary';
import { HarvestBatchLogs } from './harvest-batch-logs';
import {
  REVEAL_WIDTH,
  createBatchGroupStyles,
} from './harvest-batch-group.styles';

interface HarvestBatchGroupProps {
  group: BatchGroup<HarvestItem>;
  open: boolean;
  onToggleOpen: () => void;
  revealedId: string | null;
  onToggleReveal: (id: string) => void;
  onEditBatch: (batch: HarvestItem) => void;
  onDeleteBatch: (batch: HarvestItem, entries: HarvestItem[]) => void;
  onLogEntry: (batch: HarvestItem) => void;
  onEditEntry: (entry: HarvestItem) => void;
  onDeleteEntry: (entry: HarvestItem) => void;
}

export function HarvestBatchGroup({
  group,
  open,
  onToggleOpen,
  revealedId,
  onToggleReveal,
  onEditBatch,
  onDeleteBatch,
  onLogEntry,
  onEditEntry,
  onDeleteEntry,
}: HarvestBatchGroupProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchGroupStyles(colors), [colors]);

  const batchRevealKey = `batch:${group.root.id}`;
  const revealed = revealedId === batchRevealKey;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: revealed ? -REVEAL_WIDTH : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, translateX]);

  const visibleEntries = useMemo(
    () =>
      group.entries.filter(
        (e) => !(isAutoDraftPlaceholder(e) && group.entries.length > 1),
      ),
    [group.entries],
  );

  const totals = useMemo(() => {
    const a = visibleEntries.reduce((s, e) => s + e.classA, 0);
    const w = visibleEntries.reduce((s, e) => s + e.waste, 0);
    const pct = a + w > 0 ? Math.round((a / (a + w)) * 100) : 0;
    return { classA: Math.round(a), waste: Math.round(w), marketable: pct };
  }, [visibleEntries]);

  const days = useMemo(() => {
    const d = new Date(group.root.plantingDate);
    if (Number.isNaN(d.getTime())) return 0;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
  }, [group.root.plantingDate]);

  return (
    <View style={styles.outer}>
      <View style={styles.headerClip}>
        <View style={styles.actionsStrip}>
          <Pressable
            style={[styles.actionBtn, styles.actionEdit]}
            onPress={() => onEditBatch(group.root)}
            accessibilityLabel="Edit batch"
          >
            <Pencil size={18} color="#10b981" />
            <Text style={styles.actionEditText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionDelete]}
            onPress={() => onDeleteBatch(group.root, visibleEntries)}
            accessibilityLabel="Delete batch"
          >
            <Trash2 size={18} color="#ef4444" />
            <Text style={styles.actionDeleteText}>Delete</Text>
          </Pressable>
        </View>

        <Animated.View
          style={[styles.headerWrap, { transform: [{ translateX }] }]}
        >
          <HarvestBatchSummary
            batch={group.root}
            open={open}
            onToggleOpen={onToggleOpen}
            onToggleMenu={() => onToggleReveal(batchRevealKey)}
            totals={totals}
            days={days}
          />
        </Animated.View>
      </View>

      {open ? (
        <HarvestBatchLogs
          batch={group.root}
          entries={visibleEntries}
          revealedId={revealedId}
          onToggleReveal={onToggleReveal}
          onLogEntry={onLogEntry}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
        />
      ) : null}
    </View>
  );
}
