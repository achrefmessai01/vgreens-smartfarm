import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorSourceBadge } from '@/components/ui/error-source-badge';
import { ErrorTypeBadge } from '@/components/ui/error-type-badge';
import { SystemError } from '@/generated/graphql';
import { formatDistanceToNow } from 'date-fns';
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
  const renderCard = (error: SystemError) => {
    const userName = error.user
      ? `${error.user.firstName ?? ''} ${error.user.lastName ?? ''}`.trim() ||
        error.user.email
      : '-';

    return (
      <Card className="gap-2 overflow-hidden border py-2 shadow-none">
        {/* Custom-Header implementation - using card-header breaks ux */}
        <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
          <h3 className="text-sm font-semibold leading-none line-clamp-2 pr-2">
            {error.errorMessage}
          </h3>
          <div className="shrink-0">
            {error.isResolved ? (
              <Badge variant="secondary">Resolved</Badge>
            ) : (
              <Badge variant="destructive">Active</Badge>
            )}
          </div>
        </div>

        <CardContent className="space-y-2 text-xs">
          {/* Component */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Component:</span>
            <span className="font-medium">{error.component || '-'}</span>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Type:</span>
            <ErrorTypeBadge errorType={error.errorType} />
          </div>

          {/* Source */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Source:</span>
            <ErrorSourceBadge source={error.source} />
          </div>

          {/* Severity */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Severity:</span>
            <ErrorReportSeverityBadge severity={error.severity} />
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-medium">{error.occurrenceCount ?? 1}</span>
          </div>

          {/* Created */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(error.createdAt))} ago
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">User:</span>
            <span className="font-medium">{userName}</span>
          </div>
        </CardContent>

        {/* Custom-Footer implementation - using card-footer breaks ux */}
        <div className="flex items-center border-t px-6 pt-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(error)}
              className="h-8"
              disabled={isLoading}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            {!error.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(error)}
                className="h-8"
                disabled={isLoading || isResolving}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Resolve
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return { renderCard };
};
