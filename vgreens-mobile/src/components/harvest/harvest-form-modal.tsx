import type { Dispatch, SetStateAction } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import type { BatchFormData, BatchFormErrors } from '@/types/harvest';
import { useAppTheme } from '@/lib/theme-preference';
import { HarvestBatchForm } from './harvest-batch-form';
import { createFormModalStyles } from './harvest-form-modal.styles';

interface HarvestFormModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  submitLabel?: string;
  formData: BatchFormData;
  setFormData: Dispatch<SetStateAction<BatchFormData>>;
  errors: BatchFormErrors;
  loading?: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export function HarvestFormModal({
  visible,
  title,
  subtitle,
  submitLabel,
  formData,
  setFormData,
  errors,
  loading,
  readOnly,
  onClose,
  onSubmit,
}: HarvestFormModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createFormModalStyles(colors), [colors]);

  const showSubmit = !readOnly && !!onSubmit && !!submitLabel;
  const resolvedSubtitle =
    subtitle ?? (readOnly ? 'Read-only view' : undefined);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.kb}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.titleCol}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {resolvedSubtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {resolvedSubtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              style={styles.close}
              hitSlop={8}
              accessibilityLabel="Close"
            >
              <X size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <HarvestBatchForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              readOnly={readOnly}
            />
          </ScrollView>

          {showSubmit ? (
            <View
              style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <Pressable
                style={[styles.submit, loading && styles.submitDisabled]}
                onPress={onSubmit}
                disabled={loading}
                accessibilityLabel={submitLabel}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={styles.submitText}>{submitLabel}</Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
