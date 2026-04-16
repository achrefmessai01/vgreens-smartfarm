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
import { formatDistanceToNow } from 'date-fns';
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
  if (!error) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!left-0 !top-0 !flex !h-[100dvh] !max-h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 !flex-col !gap-0 !overflow-hidden !rounded-none !border-0 !p-0 sm:!max-w-none 2xl:!top-[50%] 2xl:!left-[50%] 2xl:!h-auto 2xl:!max-h-[calc(100vh-2rem)] 2xl:!w-full 2xl:!max-w-2xl 2xl:!translate-x-[-50%] 2xl:!translate-y-[-50%] 2xl:!rounded-lg 2xl:!border">
        <DialogHeader className="border-b px-4 py-3 text-left sm:px-5 sm:py-3 2xl:px-6 2xl:py-4">
          <DialogTitle className="flex items-start gap-2 pr-8 leading-tight">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="break-words">Error Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 2xl:space-y-6 2xl:px-6 2xl:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">
              {error.isResolved ? (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Resolved
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Open
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
                {isResolving ? 'Resolving...' : 'Resolve'}
              </Button>
            )}
          </div>

          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="mb-2 font-medium text-red-800">Error Message</h3>
            <p className="font-mono text-xs break-all text-red-700 sm:text-sm">
              {error.errorMessage}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">Type</div>
              <ErrorTypeBadge errorType={error.errorType} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">Source</div>
              <ErrorSourceBadge source={error.source} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-sm font-medium">Severity</div>
              <ErrorReportSeverityBadge severity={error.severity} />
            </div>
          </div>

          {(error.component || error.action) && (
            <div className="space-y-2">
              {error.component && (
                <div className="text-sm break-words">
                  <span className="font-medium">Component:</span>{' '}
                  {error.component}
                </div>
              )}
              {error.action && (
                <div className="text-sm break-words">
                  <span className="font-medium">Action:</span> {error.action}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-1 font-medium">User/Tenant</div>
              <div className="text-gray-600 break-words">
                {error.user ? (
                  <span>
                    {error.user.firstName} {error.user.lastName}
                  </span>
                ) : error.tenant ? (
                  <span>{error.tenant.name}</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="mb-1 font-medium">Frequency</div>
              <div className="text-gray-600">
                {error.occurrenceCount || 1} occurrence
                {(error.occurrenceCount || 1) > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-500">
            <div className="break-all">ID: {error.id}</div>
            <div>
              Created: {formatDistanceToNow(new Date(error.createdAt))} ago
            </div>
            {error.lastOccurredAt && (
              <div>
                Last occurred:{' '}
                {formatDistanceToNow(new Date(error.lastOccurredAt))} ago
              </div>
            )}
            {error.updatedAt && (
              <div>
                Updated: {formatDistanceToNow(new Date(error.updatedAt))} ago
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
