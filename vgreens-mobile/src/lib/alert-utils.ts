import {
  AlertSeverity,
  AlertStatus,
  type Alert,
} from '@/generated/graphql';

export function formatAlertUserName(
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null,
): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  return name || user?.email || '—';
}

export function formatAlertTimestamp(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export function getAlertActionFlags(alert: Alert | null): {
  canAcknowledge: boolean;
  canResolve: boolean;
} {
  if (!alert) {
    return { canAcknowledge: false, canResolve: false };
  }
  const canAcknowledge =
    alert.status === AlertStatus.Open && alert.acknowledgedBy == null;
  const canResolve =
    (alert.status === AlertStatus.Open ||
      alert.status === AlertStatus.Acknowledged) &&
    alert.resolvedBy == null &&
    alert.acknowledgedBy != null;
  return { canAcknowledge, canResolve };
}

export function statusLabel(status?: AlertStatus | null): string {
  switch (status) {
    case AlertStatus.Open:
      return 'Open';
    case AlertStatus.Acknowledged:
      return 'Acknowledged';
    case AlertStatus.Resolved:
      return 'Resolved';
    default:
      return '—';
  }
}

export function severityLabel(severity?: AlertSeverity | null): string {
  switch (severity) {
    case AlertSeverity.Critical:
      return 'Critical';
    default:
      return severity ?? '—';
  }
}
