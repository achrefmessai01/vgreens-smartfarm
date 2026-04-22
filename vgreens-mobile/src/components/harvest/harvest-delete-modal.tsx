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

interface HarvestDeleteModalProps {
  visible: boolean;
  loading: boolean;
  batchLabel: string;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function HarvestDeleteModal({
  visible,
  loading,
  batchLabel,
  title,
  onClose,
  onConfirm,
}: HarvestDeleteModalProps) {
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
        bold: { fontWeight: '700', color: colors.foreground },
        row: { flexDirection: 'row', gap: 12, marginTop: 20 },
        cancel: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: colors.muted,
          alignItems: 'center',
        },
        cancelText: { fontWeight: '600', color: colors.foreground },
        danger: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          backgroundColor: '#b91c1c',
          alignItems: 'center',
        },
        dangerText: { fontWeight: '700', color: '#fff' },
        disabled: { opacity: 0.6 },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title ?? 'Delete harvest?'}</Text>
          <Text style={styles.body}>
            This will permanently remove{' '}
            <Text style={styles.bold}>{batchLabel}</Text>. This cannot be
            undone.
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.danger, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.dangerText}>Delete</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
