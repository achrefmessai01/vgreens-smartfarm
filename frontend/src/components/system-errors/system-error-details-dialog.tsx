'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorSourceBadge } from '@/components/ui/error-source-badge';
import { ErrorTypeBadge } from '@/components/ui/error-type-badge';
import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge';
import { SystemError } from '@/generated/graphql';
import { useI18n, useLocaleFormatters } from '@/i18n';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SystemErrorDetailsDialogProps {
  error: SystemError | null;
  open: boolean;
  onClose: () => void;
  onResolve?: (errorId: string, resolutionNotes?: string) => Promise<void>;
  isResolving?: boolean;
}

export function SystemErrorDetailsDialog({
  error,
  open,
  onClose,
  onResolve,
  isResolving = false,
}: SystemErrorDetailsDialogProps) {
  const { t } = useI18n();
  const { formatRelativeTime } = useLocaleFormatters();

  if (!error) return null;

  const occurrenceCount = error.occurrenceCount || 1;
  const occurrenceLabel =
    occurrenceCount > 1
      ? t.pages.admin.systemErrors.details.occurrencePlural.replace(
          '{count}',
          String(occurrenceCount),
        )
      : t.pages.admin.systemErrors.details.occurrenceSingular.replace(
          '{count}',
          String(occurrenceCount),
        );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!top-0 !left-0 !flex !h-[100dvh] !max-h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-0 !overflow-hidden !rounded-none !border-0 !p-0 sm:!max-w-none 2xl:!top-[50%] 2xl:!left-[50%] 2xl:!h-auto 2xl:!max-h-[calc(100vh-2rem)] 2xl:!w-full 2xl:!max-w-2xl 2xl:!translate-x-[-50%] 2xl:!translate-y-[-50%] 2xl:!rounded-lg 2xl:!border">
        <DialogHeader className="border-b px-4 py-3 text-left sm:px-5 sm:py-3 2xl:px-6 2xl:py-4">
          <DialogTitle className="flex items-start gap-2 pr-8 leading-tight">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="break-words">
              {t.pages.admin.systemErrors.details.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 2xl:space-y-6 2xl:px-6 2xl:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">
              {error.isResolved ? (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {t.pages.admin.reports.statuses.resolved}
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {t.pages.admin.reports.statuses.open}
                </Badge>
              )}
            </div>
            {!error.isResolved && onResolve && (
              <Button
                onClick={() => onResolve(error.id)}
                disabled={isResolving}
                size="sm"
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isResolving
                  ? t.pages.admin.systemErrors.resolving
                  : t.pages.admin.systemErrors.resolve}
              </Button>
            )}
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-medium text-red-800">
              {t.pages.admin.systemErrors.details.errorMessage}
            </h3>
            <p className="font-mono text-xs break-all text-red-700 sm:text-sm">
              {error.errorMessage}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">
                {t.pages.admin.reports.type}
              </div>
              <ErrorTypeBadge errorType={error.errorType} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">
                {t.pages.admin.reports.source}
              </div>
              <ErrorSourceBadge source={error.source} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">
                {t.pages.admin.reports.severity}
              </div>
              <ErrorReportSeverityBadge severity={error.severity} />
            </div>
          </div>

          {(error.component || error.action) && (
            <div className="space-y-2">
              {error.component && (
                <div className="text-sm break-words">
                  <span className="font-medium">
                    {t.pages.admin.systemErrors.fieldComponent}
                  </span>{' '}
                  {error.component}
                </div>
              )}
              {error.action && (
                <div className="text-sm break-words">
                  <span className="font-medium">
                    {t.pages.admin.systemErrors.fieldAction}
                  </span>{' '}
                  {error.action}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-1 font-medium">
                {t.pages.admin.systemErrors.details.userTenant}
              </div>
              <div className="break-words text-gray-600">
                {error.user ? (
                  <span>
                    {error.user.firstName} {error.user.lastName}
                  </span>
                ) : error.tenant ? (
                  <span>{error.tenant.name}</span>
                ) : (
                  <span>{t.common.unknown}</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="mb-1 font-medium">
                {t.pages.admin.systemErrors.details.frequency}
              </div>
              <div className="text-gray-600">{occurrenceLabel}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="break-all">
              {t.pages.admin.systemErrors.details.id.replace(
                '{value}',
                error.id,
              )}
            </div>
            <div>
              {t.pages.admin.systemErrors.details.created.replace(
                '{time}',
                formatRelativeTime(error.createdAt),
              )}
            </div>
            {error.lastOccurredAt && (
              <div>
                {t.pages.admin.systemErrors.details.lastOccurred.replace(
                  '{time}',
                  formatRelativeTime(error.lastOccurredAt),
                )}
              </div>
            )}
            {error.updatedAt && (
              <div>
                {t.pages.admin.systemErrors.details.updated.replace(
                  '{time}',
                  formatRelativeTime(error.updatedAt),
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
