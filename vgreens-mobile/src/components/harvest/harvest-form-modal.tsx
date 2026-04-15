import { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';
import type { Dispatch, SetStateAction } from 'react';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestBatchForm } from './harvest-batch-form';

interface HarvestFormModalProps {
  visible: boolean;
  title: string;
  submitLabel: string;
  formData: BatchFormData;
  setFormData: Dispatch<SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function HarvestFormModal({
  visible,
  title,
  submitLabel,
  formData,
  setFormData,
  errors,
  loading,
  onClose,
  onSubmit,
}: HarvestFormModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingBottom: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        title: { fontSize: 18, fontWeight: '800', color: colors.foreground, flex: 1 },
        close: { padding: 4 },
        scroll: { flex: 1 },
        content: { padding: 16 },
        submit: {
          marginTop: 20,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: 'center',
        },
        submitDisabled: { opacity: 0.6 },
        submitText: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.primaryForeground,
        },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} style={styles.close}>
            <X size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <HarvestBatchForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
          <Pressable
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.submitText}>{submitLabel}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
