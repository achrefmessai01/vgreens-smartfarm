import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestEntryCard } from './harvest-entry-card';
import { createBatchGroupStyles } from './harvest-batch-group.styles';

interface HarvestBatchLogsProps {
  batch: HarvestItem;
  entries: HarvestItem[];
  revealedId: string | null;
  onToggleReveal: (id: string) => void;
  onLogEntry: (batch: HarvestItem) => void;
  onEditEntry: (entry: HarvestItem) => void;
  onDeleteEntry: (entry: HarvestItem) => void;
}

export function HarvestBatchLogs({
  batch,
  entries,
  revealedId,
  onToggleReveal,
  onLogEntry,
  onEditEntry,
  onDeleteEntry,
}: HarvestBatchLogsProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createBatchGroupStyles(colors), [colors]);

  return (
    <View style={styles.body}>
      <View style={styles.bodyHead}>
        <Text style={styles.bodyHeadText}>HARVEST LOGS</Text>
        <Pressable
          style={styles.logBtn}
          onPress={() => onLogEntry(batch)}
          accessibilityLabel="Log entry"
        >
          <Plus size={14} color={colors.primary} />
          <Text style={styles.logBtnText}>Log</Text>
        </Pressable>
      </View>
      {entries.length === 0 ? (
        <View style={styles.emptyBody}>
          <Text style={styles.emptyText}>No entries yet</Text>
        </View>
      ) : (
        entries.map((entry) => (
          <HarvestEntryCard
            key={entry.id}
            entry={entry}
            revealed={revealedId === `log:${entry.id}`}
            onToggleReveal={() => onToggleReveal(`log:${entry.id}`)}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry)}
          />
        ))
      )}
    </View>
  );
}
