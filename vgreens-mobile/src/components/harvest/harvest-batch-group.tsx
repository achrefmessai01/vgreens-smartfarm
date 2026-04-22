import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { getGreenhouseLabel } from '@/lib/harvest-utils';
import {
  isAutoDraftPlaceholder,
  type BatchGroup,
} from '@/lib/harvest-grouping';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestEntryCard } from './harvest-entry-card';
import { createBatchGroupStyles } from './harvest-batch-group.styles';

interface HarvestBatchGroupProps {
  group: BatchGroup<HarvestItem>;
  defaultOpen?: boolean;
  onViewBatch: (batch: HarvestItem) => void;
  onEditBatch: (batch: HarvestItem) => void;
  onDeleteBatch: (batch: HarvestItem, entries: HarvestItem[]) => void;
  onLogEntry: (batch: HarvestItem) => void;
  onViewEntry: (entry: HarvestItem) => void;
  onDeleteEntry: (entry: HarvestItem) => void;
}

export function HarvestBatchGroup({
  group,
  defaultOpen = true,
  onViewBatch,
  onEditBatch,
  onDeleteBatch,
  onLogEntry,
  onViewEntry,
  onDeleteEntry,
}: HarvestBatchGroupProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchGroupStyles(colors), [colors]);
  const [open, setOpen] = useState(defaultOpen);

  const visibleEntries = useMemo(
    () =>
      group.entries.filter(
        (e) => !(isAutoDraftPlaceholder(e) && group.entries.length > 1),
      ),
    [group.entries],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            style={styles.chevronBtn}
            onPress={() => setOpen((v) => !v)}
            hitSlop={8}
          >
            {open ? (
              <ChevronUp size={18} color={colors.mutedForeground} />
            ) : (
              <ChevronDown size={18} color={colors.mutedForeground} />
            )}
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {group.root.batch}
          </Text>
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.iconBtn, styles.iconBtnMuted]}
              onPress={() => onViewBatch(group.root)}
              accessibilityLabel="View batch"
            >
              <Eye size={16} color={colors.foreground} />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, styles.iconBtnMuted]}
              onPress={() => onEditBatch(group.root)}
              accessibilityLabel="Edit batch"
            >
              <Pencil size={16} color={colors.foreground} />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, styles.iconBtnMuted]}
              onPress={() => onDeleteBatch(group.root, visibleEntries)}
              accessibilityLabel="Delete batch"
            >
              <Trash2 size={16} color={colors.destructive} />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, styles.iconBtnPrimary]}
              onPress={() => onLogEntry(group.root)}
              accessibilityLabel="Log entry"
            >
              <Plus size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {visibleEntries.length} LOGGED
            </Text>
          </View>
          <Text style={styles.metaText}>
            {getGreenhouseLabel(group.root.greenhouse)}
          </Text>
        </View>
      </View>

      {open ? (
        <View style={styles.body}>
          {visibleEntries.length === 0 ? (
            <View style={styles.emptyBody}>
              <Text style={styles.emptyText}>No entries yet</Text>
              <Text style={styles.emptyHint}>
                Tap the + icon above to log the first harvest entry.
              </Text>
            </View>
          ) : (
            visibleEntries.map((entry) => (
              <HarvestEntryCard
                key={entry.id}
                entry={entry}
                onView={() => onViewEntry(entry)}
                onDelete={() => onDeleteEntry(entry)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
