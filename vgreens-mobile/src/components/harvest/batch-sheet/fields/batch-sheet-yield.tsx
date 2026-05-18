import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';
import type { YieldField } from '@/types/batch-sheet';

interface BatchSheetYieldProps {
  marketable: number;
  waste: number;
  rowX: number;
  rowY: number;
  disabled?: boolean;
  onYieldChange: (field: YieldField, value: number) => void;
}

function parseValue(raw: string): number {
  const parsed = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function BatchSheetYield({
  marketable,
  waste,
  rowX,
  rowY,
  disabled,
  onYieldChange,
}: BatchSheetYieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 12 },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        title: { fontSize: 15, fontWeight: '700', color: colors.foreground },
        total: { fontSize: 22, fontWeight: '700', color: '#0d9488' },
        sectionLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        grid: { flexDirection: 'row', gap: 12 },
        cell: { flex: 1, gap: 6 },
        cellLabel: {
          fontSize: 13,
          color: colors.mutedForeground,
          textAlign: 'center',
        },
        inputBig: {
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 22,
          textAlign: 'center',
          paddingHorizontal: 8,
        },
        inputSmall: {
          height: 44,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 16,
          textAlign: 'center',
          paddingHorizontal: 8,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today&apos;s Harvest</Text>
        <Text style={styles.total}>{marketable.toFixed(1)} kg</Text>
      </View>
      <Text style={styles.sectionLabel}>Yield Data</Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Marketable (kg)</Text>
          <TextInput
            style={styles.inputBig}
            value={marketable === 0 ? '' : String(marketable)}
            onChangeText={(t) => onYieldChange('marketable', parseValue(t))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            editable={!disabled}
          />
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Waste (kg)</Text>
          <TextInput
            style={styles.inputBig}
            value={waste === 0 ? '' : String(waste)}
            onChangeText={(t) => onYieldChange('waste', parseValue(t))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            editable={!disabled}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Row range harvested</Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Row X (from)</Text>
          <TextInput
            style={styles.inputSmall}
            value={rowX === 0 ? '' : String(rowX)}
            onChangeText={(t) => onYieldChange('rowX', parseValue(t))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            editable={!disabled}
          />
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Row Y (to)</Text>
          <TextInput
            style={styles.inputSmall}
            value={rowY === 0 ? '' : String(rowY)}
            onChangeText={(t) => onYieldChange('rowY', parseValue(t))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            editable={!disabled}
          />
        </View>
      </View>
    </View>
  );
}
