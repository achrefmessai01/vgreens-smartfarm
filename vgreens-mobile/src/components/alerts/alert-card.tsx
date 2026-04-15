import { View, Text, Pressable } from 'react-native';
import type { Alert } from '@/generated/graphql';
import {
  formatAlertTimestamp,
  severityLabel,
  statusLabel,
} from '@/lib/alert-utils';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

export function AlertCard({ alert, onPress }: AlertCardProps) {
  const title = alert.field?.trim() || alert.sensorName || 'Alert';
  const subtitle = alert.measurement
    ? `${alert.sensorName} · ${alert.measurement}`
    : alert.sensorName;

  return (
    <Pressable
      onPress={() => onPress(alert)}
      className="rounded-xl border border-border bg-card px-4 py-3.5 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            className="text-[15px] font-semibold text-card-foreground"
            numberOfLines={2}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text
              className="mt-0.5 text-[13px] text-muted-foreground"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
          <Text className="mt-1 text-xs text-muted-foreground">
            {formatAlertTimestamp(alert.timestamp)}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View className="rounded-md bg-muted px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-foreground">
              {statusLabel(alert.status)}
            </Text>
          </View>
          <Text className="text-[11px] font-medium text-destructive">
            {severityLabel(alert.severity)}
          </Text>
        </View>
      </View>
      {!!alert.description && (
        <Text
          className="mt-2 text-[13px] text-muted-foreground"
          numberOfLines={2}
        >
          {alert.description}
        </Text>
      )}
    </Pressable>
  );
}
