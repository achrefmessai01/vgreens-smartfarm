import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { computeAvgBrix } from '@/lib/harvest-utils';
import { useAppTheme } from '@/lib/theme-preference';
import type { BrixField, BrixMeasurements } from '@/types/batch-sheet';

interface BatchSheetBrixProps {
  measurements: BrixMeasurements;
  disabled?: boolean;
  onMeasurementChange: (field: BrixField, value: number) => void;
}

function parseValue(raw: string): number {
  const parsed = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

const FIELDS: BrixField[] = [
  'brix1',
  'brix2',
  'brix3',
  'brix4',
  'brix5',
  'brix6',
  'brix7',
  'brix8',
  'brix9',
  'brix10',
];

export function BatchSheetBrix({
  measurements,
  disabled,
  onMeasurementChange,
}: BatchSheetBrixProps) {
  const { colors } = useAppTheme();
  const avg = computeAvgBrix(measurements);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 12 },
        sectionLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.mutedForeground,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        title: { fontSize: 14, fontWeight: '600', color: colors.foreground },
        avgLabel: { fontSize: 12, color: colors.mutedForeground },
        avgValue: { fontSize: 16, fontWeight: '700', color: '#f97316' },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        },
        cell: { width: '47%', gap: 4 },
        label: { fontSize: 12, color: colors.mutedForeground },
        input: {
          height: 42,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.foreground,
          paddingHorizontal: 10,
          fontSize: 15,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Quality Metrics</Text>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Brix Measurements</Text>
        <Text style={styles.avgLabel}>
          Average:{' '}
          <Text style={styles.avgValue}>{avg > 0 ? avg.toFixed(1) : '0.0'}°Bx</Text>
        </Text>
      </View>
      <View style={styles.grid}>
        {FIELDS.map((field, index) => (
          <View key={field} style={styles.cell}>
            <Text style={styles.label}>Brix {index + 1}</Text>
            <TextInput
              style={styles.input}
              value={
                measurements[field] === 0 ? '' : String(measurements[field])
              }
              onChangeText={(t) => onMeasurementChange(field, parseValue(t))}
              keyboardType="decimal-pad"
              placeholder={`Brix ${index + 1}`}
              placeholderTextColor={colors.mutedForeground}
              editable={!disabled}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
