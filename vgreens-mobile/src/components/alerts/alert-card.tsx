import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react-native';
import { AlertStatus, type Alert } from '@/generated/graphql';
import {
  formatRelativeTime,
  getSeverityPalette,
  getStatusPalette,
} from '@/lib/alert-utils';
import { useAppTheme } from '@/lib/theme-preference';
import { createAlertCardStyles } from './alert-card.styles';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

function statusIcon(status: AlertStatus | null | undefined, color: string) {
  if (status === AlertStatus.Resolved)
    return <CheckCircle2 size={12} color={color} />;
  if (status === AlertStatus.Acknowledged)
    return <Eye size={12} color={color} />;
  return <AlertTriangle size={12} color={color} />;
}

function AlertCardBase({ alert, onPress }: AlertCardProps) {
  const { colors } = useAppTheme();
  const sev = getSeverityPalette(alert.severity);
  const stat = getStatusPalette(alert.status);
  const styles = useMemo(
    () => createAlertCardStyles(colors, sev, stat),
    [colors, sev, stat],
  );

  const title = alert.field?.trim() || alert.sensorName || 'Alert';
  const subtitle = alert.sensorName;

  return (
    <Pressable
      onPress={() => onPress(alert)}
      style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.card}>
        <View style={styles.bar} />
        <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.titleCol}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.pill}>
            {statusIcon(alert.status, stat.color)}
            <Text style={styles.pillText}>{stat.label}</Text>
          </View>
        </View>

        {alert.value ? (
          <View style={styles.valueRow}>
            <Text style={styles.value}>{alert.value}</Text>
            {alert.measurement ? (
              <Text style={styles.measurement}>{alert.measurement}</Text>
            ) : null}
          </View>
        ) : null}

        {alert.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {alert.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.sevChip}>
            <Text style={styles.sevText}>{sev.label.toUpperCase()}</Text>
          </View>
          <Text style={styles.time}>{formatRelativeTime(alert.timestamp)}</Text>
        </View>
        </View>
      </View>
    </Pressable>
  );
}

export const AlertCard = memo(AlertCardBase);
AlertCard.displayName = 'AlertCard';
