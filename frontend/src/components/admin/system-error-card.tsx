'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ErrorReportSeverityBadge,
  ErrorReportStatusBadge,
} from '@/components/error-reports';
import { ReportSeverity, ReportStatus } from '@/types/error-types';
import { useI18n } from '@/i18n';
import { Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface SystemErrorData {
  id: string;
  source: string;
  errorType: string;
  severity: ReportSeverity;
  errorMessage: string;
  component?: string | null;
  action?: string | null;
  occurrenceCount?: number | null;
  isResolved: boolean;
  createdAt: string;
  lastOccurredAt?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  tenant?: { name: string } | null;
}

interface SystemErrorCardProps {
  error: SystemErrorData;
  onResolve: (id: string) => void;
}

export function SystemErrorCard({ error, onResolve }: SystemErrorCardProps) {
  const { t } = useI18n();
  const isCritical =
    error.severity === 'CRITICAL' || error.severity === 'URGENT';

  const userDisplay = error.user
    ? `${error.user.firstName || ''} ${error.user.lastName || ''}`.trim() +
      (error.user.email ? ` (${error.user.email})` : '')
    : '';

  return (
    <div
      className={`space-y-3 rounded-lg border p-4 ${
        isCritical
          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ErrorReportSeverityBadge severity={error.severity} />
            <Badge variant="outline">{error.source}</Badge>
            <Badge variant="outline">{error.errorType}</Badge>
            {error.occurrenceCount && error.occurrenceCount > 1 && (
              <Badge variant="destructive">{error.occurrenceCount}x</Badge>
            )}
            <ErrorReportStatusBadge
              status={
                error.isResolved ? ReportStatus.Resolved : ReportStatus.Open
              }
              showIcon
            />
          </div>

          <h3 className="text-sm font-medium">{error.errorMessage}</h3>

          <div className="text-muted-foreground space-y-1 text-xs">
            {error.component && (
              <p>
                {t.pages.admin.systemErrors.component.replace(
                  '{value}',
                  error.component,
                )}
              </p>
            )}
            {error.action && (
              <p>
                {t.pages.admin.systemErrors.action.replace(
                  '{value}',
                  error.action,
                )}
              </p>
            )}
            {error.user &&
              (error.user.firstName ||
                error.user.lastName ||
                error.user.email) && (
                <p>
                  {t.pages.admin.systemErrors.user.replace(
                    '{value}',
                    userDisplay,
                  )}
                </p>
              )}
            {error.tenant && (
              <p>
                {t.pages.admin.systemErrors.tenant.replace(
                  '{value}',
                  error.tenant.name,
                )}
              </p>
            )}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t.pages.admin.systemErrors.firstSeen.replace(
                  '{time}',
                  formatDistanceToNow(new Date(error.createdAt)),
                )}
              </span>
              {error.lastOccurredAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t.pages.admin.systemErrors.lastSeen.replace(
                    '{time}',
                    formatDistanceToNow(new Date(error.lastOccurredAt)),
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {!error.isResolved && (
          <Button
            size="sm"
            onClick={() => onResolve(error.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
