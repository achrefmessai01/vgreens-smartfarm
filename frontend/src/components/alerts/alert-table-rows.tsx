import { Card, CardContent } from '@/components/ui/card';
import { TableCell } from '@/components/ui/table';
import { Alert, AlertStatus } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  getActionState,
  renderPrimaryActions,
  renderSecondaryActions,
  type ActionHandlers,
} from './alert-table-actions';
import {
  formatFieldLabel,
  formatTimestamp,
  formatUser,
  getRowClassName,
  getSeverityBadge,
  getStatusBadge,
} from './alert-table-utils';

/**
 * Row and card rendering components for alert table
 */

export const hasAnyActions = (alert: Alert, hasSecondaryActions: boolean) => {
  const { canAcknowledge, canResolve } = getActionState(alert);
  return canAcknowledge || canResolve || hasSecondaryActions;
};

export const useAlertTableRow = (actionHandlers: ActionHandlers) => {
  const { t } = useI18n();
  const hideEditButton = true;
  const hasSecondaryActions = Boolean(
    (actionHandlers.onEdit && !hideEditButton) || actionHandlers.onDelete,
  );

  const renderRow = (alert: Alert) => {
    const rowClassName = getRowClassName(alert);
    const isResolved = alert.status === AlertStatus.Resolved;
    const textClassName = isResolved ? 'text-muted-foreground' : '';
    const cellClassName = `${rowClassName} ${textClassName}`.trim();

    return (
      <>
        <TableCell className={`font-medium ${cellClassName}`.trim()}>
          {alert.sensorName}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatFieldLabel(alert.field)}
        </TableCell>
        <TableCell className={cellClassName}>{alert.value}</TableCell>
        <TableCell className={cellClassName}>
          {getStatusBadge(alert.status, t)}
        </TableCell>
        <TableCell className={cellClassName}>
          {getSeverityBadge(alert.severity, t)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatTimestamp(alert.timestamp)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatUser(alert.acknowledgedBy)}
        </TableCell>
        <TableCell className={cellClassName}>
          {formatUser(alert.resolvedBy)}
        </TableCell>
        <TableCell className={`text-right ${cellClassName}`.trim()}>
          <div className="flex items-center justify-end gap-2">
            {renderPrimaryActions(alert, actionHandlers, t)}
            {hasSecondaryActions
              ? renderSecondaryActions(alert, actionHandlers)
              : null}
          </div>
        </TableCell>
      </>
    );
  };

  const renderCard = (alert: Alert) => {
    const rowClassName = getRowClassName(alert);
    const isResolved = alert.status === AlertStatus.Resolved;
    const textClassName = isResolved ? 'text-muted-foreground' : '';

    return (
      <Card
        className={cn(
          'gap-2 overflow-hidden border py-2 shadow-none',
          rowClassName,
        )}
      >
        {/* Custom-Header implementation */}
        <div className="flex flex-row items-center justify-between gap-2 border-b px-6 pb-2">
          <h3
            className={cn('text-sm font-semibold leading-none', textClassName)}
          >
            {alert.sensorName}
          </h3>
          <div className="flex shrink-0 flex-wrap gap-2">
            {getStatusBadge(alert.status, t)}
            {getSeverityBadge(alert.severity, t)}
          </div>
        </div>

        <CardContent className="space-y-2 text-xs">
          {/* Field */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.alerts.field ?? 'Parameter'}:
            </span>
            <span className={cn('font-medium', textClassName)}>
              {formatFieldLabel(alert.field)}
            </span>
          </div>

          {/* Value */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.alerts.value}:
            </span>
            <span className={cn('font-medium', textClassName)}>
              {alert.value}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.alerts.timestamp}:
            </span>
            <span className={cn('font-medium', textClassName)}>
              {formatTimestamp(alert.timestamp)}
            </span>
          </div>

          {/* Acknowledged By */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.alerts.acknowledgedBy}:
            </span>
            <span className={cn('font-medium', textClassName)}>
              {formatUser(alert.acknowledgedBy)}
            </span>
          </div>

          {/* Resolved By */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {t.pages.alerts.resolvedBy}:
            </span>
            <span className={cn('font-medium', textClassName)}>
              {formatUser(alert.resolvedBy)}
            </span>
          </div>
        </CardContent>

        {/* Custom-Footer implementation */}
        {hasAnyActions(alert, hasSecondaryActions) && (
          <div className="flex items-center gap-2 border-t px-6 pt-2">
            {renderPrimaryActions(alert, actionHandlers, t, false)}
            {hasSecondaryActions && (
              <div className="ml-auto flex items-center gap-2">
                {renderSecondaryActions(alert, actionHandlers)}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return { renderRow, renderCard };
};
