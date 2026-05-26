import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorSourceBadge } from '@/components/ui/error-source-badge';
import { ErrorTypeBadge } from '@/components/ui/error-type-badge';
import { SystemError } from '@/generated/graphql';
import { useI18n, useLocaleFormatters } from '@/i18n';
import { CheckCircle2, Eye } from 'lucide-react';

/**
 * Card rendering components for system errors table
 */

interface SystemErrorsCardProps {
  onResolve: (error: SystemError) => void;
  onViewDetails: (error: SystemError) => void;
  isLoading?: boolean;
  isResolving?: boolean;
}

export const useSystemErrorsCard = ({
  onResolve,
  onViewDetails,
  isLoading = false,
  isResolving = false,
}: SystemErrorsCardProps) => {
  const { t } = useI18n();
  const { formatRelativeTime } = useLocaleFormatters();

  const renderCard = (error: SystemError) => {
    const userName = error.user
      ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() ||
        error.user.email
      : '-';

    return (
      <Card className="gap-0 overflow-hidden border py-0 shadow-sm">
        {/* Custom-Header implementation - using card-header breaks ux */}
        <div className="flex flex-col gap-3 border-b px-3 py-3 sm:px-4 xl:flex-row xl:items-start xl:justify-between xl:px-5">
          <h3 className="line-clamp-4 min-w-0 text-sm leading-snug font-semibold break-words">
            {error.errorMessage}
          </h3>
          <div className="shrink-0 self-start">
            {error.isResolved ? (
              <Badge variant="secondary">
                {t.pages.admin.reports.statuses.resolved}
              </Badge>
            ) : (
              <Badge variant="destructive">
                {t.pages.admin.systemErrors.active}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="grid gap-3 px-3 py-3 text-sm sm:px-4 lg:grid-cols-2 xl:px-5">
          {/* Component */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldComponent}
            </span>
            <span className="font-medium break-words">
              {error.component || '-'}
            </span>
          </div>

          {/* Type */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldType}
            </span>
            <ErrorTypeBadge errorType={error.errorType} />
          </div>

          {/* Source */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldSource}
            </span>
            <ErrorSourceBadge source={error.source} />
          </div>

          {/* Severity */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldSeverity}
            </span>
            <ErrorReportSeverityBadge severity={error.severity} />
          </div>

          {/* Count */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldCount}
            </span>
            <span className="font-medium">{error.occurrenceCount ?? 1}</span>
          </div>

          {/* Created */}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldCreated}
            </span>
            <span className="font-medium">
              {t.pages.admin.systemErrors.timeAgo.replace(
                '{time}',
                formatRelativeTime(error.createdAt),
              )}
            </span>
          </div>

          {/* User */}
          <div className="flex min-w-0 flex-col gap-1 lg:col-span-2">
            <span className="text-muted-foreground shrink-0">
              {t.pages.admin.systemErrors.fieldUser}
            </span>
            <span className="font-medium break-words">{userName}</span>
          </div>
        </CardContent>

        {/* Custom-Footer implementation - using card-footer breaks ux */}
        <div className="border-t px-3 py-3 sm:px-4 xl:px-5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(error)}
              className="h-9 w-full justify-center"
              disabled={isLoading}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t.pages.admin.systemErrors.view}
            </Button>
            {!error.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(error)}
                className="h-9 w-full justify-center"
                disabled={isLoading || isResolving}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t.pages.admin.systemErrors.resolve}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return { renderCard };
};
