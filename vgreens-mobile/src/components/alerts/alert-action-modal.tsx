import { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '@/lib/theme-preference';

interface AlertActionModalProps {
  visible: boolean;
  loading: boolean;
  action: 'acknowledge' | 'resolve' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AlertActionModal({
  visible,
  loading,
  action,
  onConfirm,
  onCancel,
}: AlertActionModalProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        },
        sheet: {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        },
        title: { fontSize: 18, fontWeight: '800', color: colors.foreground },
        body: {
          fontSize: 14,
          color: colors.mutedForeground,
          marginTop: 10,
          lineHeight: 20,
        },
        row: { flexDirection: 'row', gap: 12, marginTop: 20 },
        cancel: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: colors.muted,
          alignItems: 'center',
        },
        cancelText: { fontWeight: '600', color: colors.foreground },
        primary: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: colors.primary,
          alignItems: 'center',
        },
        primaryText: { fontWeight: '700', color: colors.primaryForeground },
        disabled: { opacity: 0.6 },
      }),
    [colors],
  );

  const title =
    action === 'acknowledge' ? 'Acknowledge alert?' : 'Resolve alert?';
  const body =
    action === 'acknowledge'
      ? 'Mark this alert as acknowledged. You can resolve it after acknowledgment.'
      : 'Mark this alert as resolved. This closes it for your team.';
  const confirmLabel = action === 'acknowledge' ? 'Acknowledge' : 'Resolve';

  if (!action) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.row}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primary, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Text style={styles.primaryText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
