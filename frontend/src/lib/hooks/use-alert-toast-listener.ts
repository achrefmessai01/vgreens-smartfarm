'use client';

import * as React from 'react';
import {
  AlertStatus,
  UserRole,
  useTenantFeaturesQuery,
} from '@/generated/graphql';
import type { UserData } from '@/lib/graphql-compat';
import { useSubscription } from '@apollo/client/react';
import { ALERT_CREATED_SUBSCRIPTION } from '@/graphql/subscriptions/alert.subscriptions';
import { useToast } from '@/components/ui/toast-provider';
import { useI18n } from '@/i18n';

const MAX_TRACKED_ALERTS = 200;

/** Shape of the alert pushed by the `alertCreated` subscription. */
type ToastableAlert = {
  id: string;
  tenantId?: string | null;
  sensorName: string;
  value?: string | null;
  status: AlertStatus;
  severity?: string | null;
  description?: string | null;
  timestamp?: string | null;
  field?: string | null;
  measurement?: string | null;
  device?: string | null;
  greenhouse?: string | null;
  city?: string | null;
  column?: string | null;
  row?: string | null;
  profile?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

type AlertCreatedData = { alertCreated: ToastableAlert };

function formatFieldLabel(field?: string | null) {
  if (!field) {
    return null;
  }

  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAlertDescription(alert: ToastableAlert, fallback: string) {
  const parts = [
    formatFieldLabel(alert.field),
    alert.value,
    alert.greenhouse,
    alert.description?.trim(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' | ') : fallback;
}

export function useAlertToastListener(user?: UserData): void {
  const { t } = useI18n();
  const { toast } = useToast();
  const seenAlertIdsRef = React.useRef<Set<string>>(new Set());

  const tenantId = user?.tenantId;
  const role = user?.role as UserRole | undefined;
  const isTenantScopedUser =
    Boolean(tenantId) && role !== UserRole.VgreensAdmin;

  const { data: tenantFeaturesData, loading: tenantFeaturesLoading } =
    useTenantFeaturesQuery({
      variables: { tenantId: tenantId || undefined },
      skip: !tenantId,
      fetchPolicy: 'cache-and-network',
    });

  const alertsFeatureEnabled = React.useMemo(() => {
    if (!tenantFeaturesData?.tenantFeatures) {
      return false;
    }

    return tenantFeaturesData.tenantFeatures.some(
      (tenantFeature) =>
        tenantFeature.enabled &&
        tenantFeature.feature?.isActive &&
        tenantFeature.feature?.key === 'sensor_alerts',
    );
  }, [tenantFeaturesData]);

  const canWatchAlerts =
    isTenantScopedUser && !tenantFeaturesLoading && alertsFeatureEnabled;

  // Reset the de-dup set when the tenant or gating changes (e.g. tenant
  // switch / feature toggled).
  React.useEffect(() => {
    seenAlertIdsRef.current.clear();
  }, [tenantId, canWatchAlerts]);

  // VSL-97: receive new alerts in real time via a GraphQL subscription instead
  // of 30s polling. The subscription only delivers alerts created AFTER we
  // subscribe, so existing open alerts never produce a toast on page load.
  // `seenAlertIdsRef` still guards against duplicate toasts if the socket
  // reconnects and an alert is redelivered.
  useSubscription<AlertCreatedData>(ALERT_CREATED_SUBSCRIPTION, {
    skip: !canWatchAlerts,
    onData: ({ data }) => {
      const alert = data.data?.alertCreated;
      if (!alert) return;
      if (alert.status !== AlertStatus.Open) return;
      if (seenAlertIdsRef.current.has(alert.id)) return;

      seenAlertIdsRef.current.add(alert.id);

      // Notification-only toast: shorter duration and no action button so it
      // can't accidentally navigate the user away from a form they're filling
      // in (e.g. a harvest entry). They can always open the Alerts page from
      // the sidebar when they're ready.
      toast({
        id: `alert-${alert.id}`,
        title: `${t.pages.alerts.toastTitle}: ${alert.sensorName}`,
        description: formatAlertDescription(
          alert,
          t.pages.alerts.toastFallbackDescription,
        ),
        variant: 'destructive',
        duration: 5000,
      });

      if (seenAlertIdsRef.current.size > MAX_TRACKED_ALERTS) {
        seenAlertIdsRef.current = new Set(
          Array.from(seenAlertIdsRef.current).slice(-MAX_TRACKED_ALERTS),
        );
      }
    },
  });
}
