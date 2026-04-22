import {
  AlertSeverity,
  AlertStatus,
  type Alert,
} from '@/generated/graphql';

export interface AlertStatusPalette {
  label: string;
  color: string;
  bg: string;
}

export interface AlertSeverityPalette {
  label: string;
  color: string;
  bg: string;
}

export function getStatusPalette(status?: AlertStatus | null): AlertStatusPalette {
  switch (status) {
    case AlertStatus.Open:
      return { label: 'Open', color: '#ef4444', bg: 'rgba(239,68,68,0.14)' };
    case AlertStatus.Acknowledged:
      return { label: 'Acknowledged', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    case AlertStatus.Resolved:
      return { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.14)' };
    default:
      return { label: '—', color: '#6b7280', bg: 'rgba(107,114,128,0.14)' };
  }
}

export function getSeverityPalette(severity?: AlertSeverity | null): AlertSeverityPalette {
  switch (severity) {
    case AlertSeverity.Critical:
      return { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    default:
      return { label: severity ?? '—', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  }
}

export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString();
}

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
