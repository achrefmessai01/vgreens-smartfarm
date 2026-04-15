import { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import type { Alert } from '@/generated/graphql';
import { useAppTheme } from '@/lib/theme-preference';
import {
  formatAlertTimestamp,
  formatAlertUserName,
  getAlertActionFlags,
  severityLabel,
  statusLabel,
} from '@/lib/alert-utils';

interface AlertDetailModalProps {
  visible: boolean;
  alert: Alert | null;
  loading: boolean;
  onClose: () => void;
  onAcknowledge: (a: Alert) => void;
  onResolve: (a: Alert) => void;
  onDelete: (a: Alert) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-0.5 text-sm text-foreground">{value}</Text>
    </View>
  );
}

export function AlertDetailModal({
  visible,
  alert,
  loading,
  onClose,
  onAcknowledge,
  onResolve,
  onDelete,
}: AlertDetailModalProps) {
  const { colors } = useAppTheme();
  const flags = useMemo(() => getAlertActionFlags(alert), [alert]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        },
        sheet: {
          maxHeight: '92%',
          backgroundColor: colors.card,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
      }),
    [colors],
  );

  if (!alert) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="flex-1 text-lg font-bold text-foreground">
              Alert details
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView
            className="px-4 pt-3"
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            <Row label="Status" value={statusLabel(alert.status)} />
            <Row label="Severity" value={severityLabel(alert.severity)} />
            <Row label="Field" value={alert.field?.trim() || '—'} />
            <Row label="Sensor" value={alert.sensorName || '—'} />
            <Row label="Value" value={alert.value || '—'} />
            <Row label="When" value={formatAlertTimestamp(alert.timestamp)} />
            {!!alert.description && (
              <Row label="Description" value={alert.description} />
            )}
            <Row
              label="Acknowledged by"
              value={formatAlertUserName(alert.acknowledgedBy)}
            />
            <Row
              label="Resolved by"
              value={formatAlertUserName(alert.resolvedBy)}
            />
          </ScrollView>
          <View className="flex-row flex-wrap gap-2 border-t border-border px-4 py-3">
            {flags.canAcknowledge && (
              <Pressable
                className="flex-1 min-w-[120px] items-center rounded-xl bg-primary py-3 active:opacity-80"
                disabled={loading}
                onPress={() => onAcknowledge(alert)}
              >
                <Text className="font-bold text-primary-foreground">
                  Acknowledge
                </Text>
              </Pressable>
            )}
            {flags.canResolve && (
              <Pressable
                className="flex-1 min-w-[120px] items-center rounded-xl bg-primary py-3 active:opacity-80"
                disabled={loading}
                onPress={() => onResolve(alert)}
              >
                <Text className="font-bold text-primary-foreground">
                  Resolve
                </Text>
              </Pressable>
            )}
            <Pressable
              className="flex-1 min-w-[120px] items-center rounded-xl border border-destructive py-3 active:opacity-80"
              disabled={loading}
              onPress={() => onDelete(alert)}
            >
              <Text className="font-bold text-destructive">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
