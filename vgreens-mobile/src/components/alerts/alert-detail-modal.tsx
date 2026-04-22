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
import {
  formatAlertTimestamp,
  formatAlertUserName,
  getAlertActionFlags,
  getSeverityPalette,
  getStatusPalette,
} from '@/lib/alert-utils';
import { useAppTheme } from '@/lib/theme-preference';
import { createAlertDetailStyles } from './alert-detail-modal.styles';

interface AlertDetailModalProps {
  visible: boolean;
  alert: Alert | null;
  loading: boolean;
  onClose: () => void;
  onAcknowledge: (a: Alert) => void;
  onResolve: (a: Alert) => void;
  onDelete: (a: Alert) => void;
}

function getRows(alert: Alert): { label: string; value: string }[] {
  const valueStr = alert.value
    ? `${alert.value}${alert.measurement ? ' ' + alert.measurement : ''}`
    : '—';
  const rows: { label: string; value: string }[] = [
    { label: 'Field', value: alert.field?.trim() || '—' },
    { label: 'Sensor', value: alert.sensorName || '—' },
    { label: 'Value', value: valueStr },
    { label: 'When', value: formatAlertTimestamp(alert.timestamp) },
  ];
  if (alert.description)
    rows.push({ label: 'Description', value: alert.description });
  rows.push({
    label: 'Acknowledged by',
    value: formatAlertUserName(alert.acknowledgedBy),
  });
  rows.push({
    label: 'Resolved by',
    value: formatAlertUserName(alert.resolvedBy),
  });
  return rows;
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
  const styles = useMemo(() => createAlertDetailStyles(colors), [colors]);
  const flags = useMemo(() => getAlertActionFlags(alert), [alert]);

  if (!alert) return null;
  const stat = getStatusPalette(alert.status);
  const sev = getSeverityPalette(alert.severity);
  const rows = getRows(alert);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Alert details</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: stat.bg }]}>
              <Text style={[styles.pillText, { color: stat.color }]}>
                {stat.label}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: sev.bg }]}>
              <Text style={[styles.pillText, { color: sev.color }]}>
                {sev.label}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.label}>{r.label}</Text>
                <Text style={styles.value}>{r.value}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            {flags.canAcknowledge ? (
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                disabled={loading}
                onPress={() => onAcknowledge(alert)}
              >
                <Text style={styles.btnPrimaryText}>Acknowledge</Text>
              </Pressable>
            ) : null}
            {flags.canResolve ? (
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                disabled={loading}
                onPress={() => onResolve(alert)}
              >
                <Text style={styles.btnPrimaryText}>Resolve</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.btn, styles.btnOutline]}
              disabled={loading}
              onPress={() => onDelete(alert)}
            >
              <Text style={styles.btnOutlineText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
