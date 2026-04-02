'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Alert, AlertSeverity, AlertStatus } from '@/generated/graphql';
import {
  SensorNameField,
  ValueField,
  TimeStampField,
  DescriptionField,
  AcknowledgedByField,
  ResolvedByField,
  FieldField,
  LocationFields,
  AcknowledgedAtField,
  ResolvedAtField,
} from './alert-sidebar-fields';
import { CheckCircle2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
  isLoading?: boolean;
}

export function AlertSidebar({
  open,
  onOpenChange,
  alert,
  onAcknowledge,
  onResolve,
  isLoading = false,
}: AlertSidebarProps) {
  const { t } = useI18n();

  const canAcknowledge =
    alert?.status === AlertStatus.Open && alert?.acknowledgedBy == null;
  const canResolve =
    (alert?.status === AlertStatus.Open ||
      alert?.status === AlertStatus.Acknowledged) &&
    alert?.resolvedBy == null &&
    alert?.acknowledgedBy != null;

  const getStatusLabel = (status?: AlertStatus | null) => {
    switch (status) {
      case AlertStatus.Open:
        return t.pages.alerts.statusOpen;
      case AlertStatus.Acknowledged:
        return t.pages.alerts.statusAcknowledged;
      case AlertStatus.Resolved:
        return t.pages.alerts.statusResolved;
      default:
        return '-';
    }
  };

  const getSeverityLabel = (severity?: AlertSeverity | null) => {
    switch (severity) {
      case AlertSeverity.Critical:
        return t.pages.alerts.critical;
      default:
        return severity ?? '-';
    }
  };

  const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const formatRelativeOrAbsolute = (timestamp?: string | null) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return '-';
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleString();
  };

  const formatUser = (user?: Alert['acknowledgedBy']) => {
    if (!user) return '-';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || user.email || '-';
  };

  const statusBadge =
    alert?.status === AlertStatus.Open ? (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {getStatusLabel(alert.status)}
      </Badge>
    ) : alert?.status === AlertStatus.Acknowledged ? (
      <Badge
        variant="outline"
        className="gap-1 border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <CheckCircle2 className="h-3 w-3" />
        {getStatusLabel(alert.status)}
      </Badge>
    ) : alert?.status === AlertStatus.Resolved ? (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {getStatusLabel(alert?.status)}
      </Badge>
    ) : null;

  const severityBadge =
    alert?.severity === AlertSeverity.Critical ? (
      <Badge variant="destructive">{getSeverityLabel(alert.severity)}</Badge>
    ) : (
      <Badge variant="outline">{getSeverityLabel(alert?.severity)}</Badge>
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl',
          'bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur',
        )}
      >
        <SheetHeader className="border-border/60 border-b px-6 pt-6 pb-4">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            {t.pages.alerts.title}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {alert ? (
            <div className="space-y-6">
              {/* Status & Severity at top with labels */}
              <div className="flex flex-wrap items-end gap-4 sm:gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {t.pages.alerts.status}
                  </span>
                  <div>{statusBadge}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {t.pages.alerts.severity}
                  </span>
                  <div>{severityBadge}</div>
                </div>
              </div>

              {/* Two-column grid for main fields */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <SensorNameField
                  sensorName={alert.sensorName}
                  isLoading={isLoading}
                />
                <FieldField field={alert.field ?? '-'} isLoading={isLoading} />
                <ValueField value={alert.value} isLoading={isLoading} />
                <TimeStampField
                  timestamp={formatTimestamp(alert.timestamp)}
                  isLoading={isLoading}
                />
                <div className="sm:col-span-2">
                  <DescriptionField
                    description={alert.description || '-'}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <LocationFields
                greenhouse={alert.greenhouse}
                device={alert.device}
                city={alert.city}
                column={alert.column}
                row={alert.row}
                measurement={alert.measurement}
                profile={alert.profile}
              />

              {/* Resolution in two columns */}
              <div className="border-border/60 space-y-4 border-t pt-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t.pages.alerts.resolutionSection ?? 'Resolution'}
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <AcknowledgedByField
                    acknowledgedBy={formatUser(alert.acknowledgedBy)}
                    isLoading={isLoading}
                  />
                  <AcknowledgedAtField
                    acknowledgedAt={
                      formatRelativeOrAbsolute(alert.acknowledgedTime) ?? '-'
                    }
                    isLoading={isLoading}
                  />
                  <ResolvedByField
                    resolvedBy={formatUser(alert.resolvedBy)}
                    isLoading={isLoading}
                  />
                  <ResolvedAtField
                    resolvedAt={
                      formatRelativeOrAbsolute(alert.resolvedTime) ?? '-'
                    }
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t.pages.alerts.noAlertsDescription}
            </p>
          )}
        </div>

        <SheetFooter className="border-border/60 bg-muted/20 flex-row gap-2 border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {t.pages.alerts.cancel}
          </Button>
          {canAcknowledge && alert && onAcknowledge && (
            <Button
              variant="outline"
              onClick={() => onAcknowledge(alert)}
              disabled={isLoading}
              className="border-primary/50 text-primary hover:bg-primary/10 flex-1"
            >
              {t.pages.alerts.acknowledge}
            </Button>
          )}
          {canResolve && alert && onResolve && (
            <Button
              onClick={() => onResolve(alert)}
              disabled={isLoading}
              className="flex-1"
            >
              {t.pages.alerts.resolve}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
