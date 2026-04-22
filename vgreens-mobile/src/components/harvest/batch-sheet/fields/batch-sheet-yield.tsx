import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface BatchSheetYieldProps {
  marketable: number;
  waste: number;
  disabled?: boolean;
  onYieldChange: (field: 'marketable' | 'waste', value: number) => void;
}

function parseValue(raw: string): number {
  const parsed = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function BatchSheetYield({
  marketable,
  waste,
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
        inputWrap: { position: 'relative' },
        input: {
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          fontSize: 22,
          textAlign: 'center',
          paddingHorizontal: 8,
          paddingRight: 36,
        },
        suffix: {
          position: 'absolute',
          right: 10,
          top: 0,
          bottom: 0,
          textAlignVertical: 'center',
          color: colors.mutedForeground,
          fontSize: 13,
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
          <Text style={styles.cellLabel}>Marketable</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={marketable === 0 ? '' : String(marketable)}
              onChangeText={(t) => onYieldChange('marketable', parseValue(t))}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              editable={!disabled}
            />
            <Text style={styles.suffix}>kg</Text>
          </View>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>Waste</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={waste === 0 ? '' : String(waste)}
              onChangeText={(t) => onYieldChange('waste', parseValue(t))}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              editable={!disabled}
            />
            <Text style={styles.suffix}>kg</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
