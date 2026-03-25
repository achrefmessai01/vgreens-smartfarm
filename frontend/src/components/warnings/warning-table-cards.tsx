import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Warning } from '@/types/warning.types';
import { formatTimestamp, getStatusBadge } from './warning-table-utils';

/**
 * Card rendering components for warning table
 */

interface WarningCardProps {
  onAcknowledge: (warning: Warning) => void;
  onResolve: (warning: Warning) => void;
  translations: {
    open: string;
    acknowledged: string;
    resolved: string;
    value: string;
    timestamp: string;
    tunnel: string;
    acknowledge: string;
    resolve: string;
  };
}

export const useWarningCard = ({
  onAcknowledge,
  onResolve,
  translations,
}: WarningCardProps) => {
  const renderCard = (warning: Warning) => (
    <Card className="gap-2 overflow-hidden border py-2 shadow-none">
      {/* Custom-Header implementation - using card-header breaks ux */}
      <div className="flex flex-row items-center justify-between border-b px-6 pb-2">
        <h3 className="text-sm font-semibold leading-none dark:text-white">
          {warning.sensorName}
        </h3>
        {getStatusBadge({ status: warning.status, translations })}
      </div>

      <CardContent className="space-y-2 text-xs">
        {/* Value */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{translations.value}:</span>
          <span className="font-medium dark:text-gray-300">
            {warning.value}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {translations.timestamp}:
          </span>
          <span className="font-medium dark:text-gray-300">
            {formatTimestamp(warning.timestamp)}
          </span>
        </div>

        {/* Tunnel */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{translations.tunnel}:</span>
          <span className="font-medium dark:text-gray-300">
            {warning.tunnel || '-'}
          </span>
        </div>
      </CardContent>

      {/* Custom-Footer implementation - using card-footer breaks ux */}
      {warning.status !== 'resolved' && (
        <div className="flex items-center gap-2 border-t px-6 pt-2">
          {warning.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onAcknowledge(warning);
              }}
              className="h-8 flex-1 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
            >
              {translations.acknowledge}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onResolve(warning);
            }}
            className="h-8 flex-1"
          >
            {translations.resolve}
          </Button>
        </div>
      )}
    </Card>
  );

  return { renderCard };
};
