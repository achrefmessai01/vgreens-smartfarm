import type { Dispatch, SetStateAction } from 'react';
import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';
import { HarvestBatchField } from './harvest-batch-field';
import { HarvestFormSection } from './harvest-form-section';

interface HarvestBatchFormProps {
  formData: BatchFormData;
  setFormData: Dispatch<SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  readOnly?: boolean;
}

const num = (n: number) => (n ? String(n) : '');
const parseF = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function HarvestBatchForm({
  formData,
  setFormData,
  errors,
  readOnly,
}: HarvestBatchFormProps) {
  const styles = useMemo(() => StyleSheet.create({ wrap: { gap: 14 } }), []);
  const s = useMemo(() => {
    const text = (k: keyof BatchFormData) => (t: string) =>
      setFormData((p) => ({ ...p, [k]: t }));
    const numSet = (k: keyof BatchFormData, p: (s: string) => number) =>
      (t: string) => setFormData((prev) => ({ ...prev, [k]: p(t) }));
    return {
      sourceGreenhouse: text('sourceGreenhouse'),
      species: text('species'),
      variety: text('variety'),
      plantingDate: text('plantingDate'),
      cultivationArea: numSet('cultivationArea', parseF),
      numberOfRows: numSet('numberOfRows', parseF),
      rowLength: numSet('rowLength', parseF),
      plantsPerMeter: numSet('plantsPerMeter', parseF),
    };
  }, [setFormData]);

  return (
    <View style={styles.wrap}>
      <HarvestFormSection
        step={1}
        title="Batch identity"
        description="Where the batch lives and what's growing in it."
      >
        <HarvestBatchField
          label="Greenhouse" required readOnly={readOnly}
          value={formData.sourceGreenhouse} onChangeText={s.sourceGreenhouse}
          placeholder="e.g. GH1" error={errors.sourceGreenhouse}
        />
        <HarvestBatchField
          label="Crop" required readOnly={readOnly}
          value={formData.species} onChangeText={s.species}
          placeholder="e.g. Strawberry" error={errors.species}
        />
        <HarvestBatchField
          label="Variety" required readOnly={readOnly}
          value={formData.variety} onChangeText={s.variety}
          placeholder="Variety name" error={errors.variety}
        />
        <HarvestBatchField
          label="Planting date" required readOnly={readOnly}
          autoCapitalize="none"
          value={formData.plantingDate} onChangeText={s.plantingDate}
          placeholder="YYYY-MM-DD" error={errors.plantingDate}
        />
      </HarvestFormSection>

      <HarvestFormSection
        step={2}
        title="Plant layout"
        description="Used to compute planting density and yield per m²."
      >
        <HarvestBatchField
          label="Cultivation area" required readOnly={readOnly}
          autoCapitalize="none" keyboardType="decimal-pad" suffix="m²"
          value={num(formData.cultivationArea)} onChangeText={s.cultivationArea}
          placeholder="0" error={errors.cultivationArea}
        />
        <HarvestBatchField
          label="Number of rows" required readOnly={readOnly}
          autoCapitalize="none" keyboardType="decimal-pad" suffix="rows"
          value={num(formData.numberOfRows)} onChangeText={s.numberOfRows}
          placeholder="0" error={errors.numberOfRows}
        />
        <HarvestBatchField
          label="Row length" required readOnly={readOnly}
          autoCapitalize="none" keyboardType="decimal-pad" suffix="m"
          value={num(formData.rowLength)} onChangeText={s.rowLength}
          placeholder="0" error={errors.rowLength}
        />
        <HarvestBatchField
          label="Plants per meter" required readOnly={readOnly}
          autoCapitalize="none" keyboardType="decimal-pad" suffix="/ m"
          returnKeyType="done"
          value={num(formData.plantsPerMeter)} onChangeText={s.plantsPerMeter}
          placeholder="0" error={errors.plantsPerMeter}
        />
      </HarvestFormSection>
    </View>
  );
}
