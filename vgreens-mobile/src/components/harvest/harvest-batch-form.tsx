import type { Dispatch, SetStateAction } from 'react';
import { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';
import { Select } from '@/components/ui/select';
import { useAppTheme } from '@/lib/theme-preference';

const GH = [
  { value: 'gh1', label: 'GH1' },
  { value: 'gh2', label: 'GH2' },
];

interface HarvestBatchFormProps {
  formData: BatchFormData;
  setFormData: Dispatch<SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
}

export function HarvestBatchForm({
  formData,
  setFormData,
  errors,
}: HarvestBatchFormProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { gap: 14 },
        field: { gap: 6 },
        label: { fontSize: 13, fontWeight: '600', color: colors.foreground },
        input: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.foreground,
          backgroundColor: colors.muted,
        },
        inputErr: { borderColor: colors.destructive },
        err: { fontSize: 12, color: colors.destructive },
      }),
    [colors],
  );

  const ph = colors.mutedForeground;

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Text style={styles.label}>Greenhouse *</Text>
        <Select
          value={formData.sourceGreenhouseId}
          onValueChange={(v) =>
            setFormData((p) => ({ ...p, sourceGreenhouseId: v }))
          }
          options={GH}
          placeholder="Select greenhouse"
          title="Greenhouse"
          hasError={!!errors.sourceGreenhouseId}
        />
        {errors.sourceGreenhouseId ? (
          <Text style={styles.err}>{errors.sourceGreenhouseId}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Species *</Text>
        <TextInput
          style={[styles.input, errors.species && styles.inputErr]}
          value={formData.species}
          onChangeText={(t) => setFormData((p) => ({ ...p, species: t }))}
          placeholder="e.g. Lettuce"
          placeholderTextColor={ph}
        />
        {errors.species ? <Text style={styles.err}>{errors.species}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Variety *</Text>
        <TextInput
          style={[styles.input, errors.variety && styles.inputErr]}
          value={formData.variety}
          onChangeText={(t) => setFormData((p) => ({ ...p, variety: t }))}
          placeholder="Variety name"
          placeholderTextColor={ph}
        />
        {errors.variety ? <Text style={styles.err}>{errors.variety}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Planting date *</Text>
        <TextInput
          style={[styles.input, errors.plantingDate && styles.inputErr]}
          value={formData.plantingDate}
          onChangeText={(t) => setFormData((p) => ({ ...p, plantingDate: t }))}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={ph}
        />
        {errors.plantingDate ? (
          <Text style={styles.err}>{errors.plantingDate}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cultivation area (m²) *</Text>
        <TextInput
          style={[styles.input, errors.cultivationArea && styles.inputErr]}
          value={
            formData.cultivationArea ? String(formData.cultivationArea) : ''
          }
          onChangeText={(t) =>
            setFormData((p) => ({
              ...p,
              cultivationArea: parseFloat(t) || 0,
            }))
          }
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={ph}
        />
        {errors.cultivationArea ? (
          <Text style={styles.err}>{errors.cultivationArea}</Text>
        ) : null}
      </View>
    </View>
  );
}
