import { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  User,
} from 'lucide-react-native';
import type { HarvestItem } from '@/lib/hooks/use-harvest-page';
import { formatHarvestDate } from '@/lib/harvest-utils';
import { getCreatedByLabel } from '@/lib/harvest-grouping';
import { useAppTheme } from '@/lib/theme-preference';
import { REVEAL_WIDTH, createEntryCardStyles } from './harvest-entry-card.styles';

interface HarvestEntryCardProps {
  entry: HarvestItem;
  revealed: boolean;
  onToggleReveal: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HarvestEntryCard({
  entry,
  revealed,
  onToggleReveal,
  onEdit,
  onDelete,
}: HarvestEntryCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createEntryCardStyles(colors), [colors]);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: revealed ? -REVEAL_WIDTH : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, translateX]);

  return (
    <View style={styles.outer}>
      <View style={styles.actionsStrip}>
        <Pressable
          style={[styles.actionBtn, styles.actionEdit]}
          onPress={onEdit}
          accessibilityLabel="Edit log"
        >
          <Pencil size={18} color="#10b981" />
          <Text style={styles.actionEditText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionDelete]}
          onPress={onDelete}
          accessibilityLabel="Delete log"
        >
          <Trash2 size={18} color="#ef4444" />
          <Text style={styles.actionDeleteText}>Delete</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[styles.cardWrap, { transform: [{ translateX }] }]}
      >
        <View style={styles.card}>
          <View style={styles.leftCol}>
            <View style={styles.row}>
              <Calendar size={12} color={colors.mutedForeground} />
              <Text style={styles.date}>{formatHarvestDate(entry.date)}</Text>
            </View>
            <View style={styles.row}>
              <User size={12} color={colors.mutedForeground} />
              <Text style={styles.author} numberOfLines={1}>
                {getCreatedByLabel(entry)}
              </Text>
            </View>
          </View>

          <View style={styles.rightCol}>
            <View style={styles.numbersRow}>
              <Text style={[styles.num, styles.numGood]}>
                {Math.round(entry.classA)}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={[styles.num, styles.numBad]}>
                {Math.round(entry.waste)}
              </Text>
            </View>
            <View style={styles.brixChip}>
              <Text style={styles.brixText}>{entry.avgBrix}°Bx</Text>
            </View>
          </View>

          <Pressable
            style={styles.menuBtn}
            hitSlop={8}
            onPress={onToggleReveal}
            accessibilityLabel="Toggle log actions"
          >
            <MoreVertical size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
