import * as React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { Alert, AlertStatus } from '@/generated/graphql'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { 
  formatFieldLabel, 
  formatTimestamp, 
  formatUser, 
  getRowClassName, 
  getStatusBadge, 
  getSeverityBadge 
} from './alert-table-utils'
import { 
  getActionState, 
  renderPrimaryActions, 
  renderSecondaryActions,
  type ActionHandlers 
} from './alert-table-actions'

/**
 * Row and card rendering components for alert table
 */

export const hasAnyActions = (alert: Alert, hasSecondaryActions: boolean) => {
  const { canAcknowledge, canResolve } = getActionState(alert)
  return canAcknowledge || canResolve || hasSecondaryActions
}

export const useAlertTableRow = (actionHandlers: ActionHandlers) => {
  const { t } = useI18n()
  const hideEditButton = true
  const hasSecondaryActions = Boolean(
    (actionHandlers.onEdit && !hideEditButton) || actionHandlers.onDelete
  )

  const renderRow = (alert: Alert) => {
    const rowClassName = getRowClassName(alert)
    const isResolved = alert.status === AlertStatus.Resolved
    const textClassName = isResolved ? 'text-muted-foreground' : ''
    const cellClassName = `${rowClassName} ${textClassName}`.trim()

    return (
      <>
        <TableCell className={`font-medium ${cellClassName}`.trim()}>
          {alert.sensorName}
        </TableCell>
        <TableCell className={cellClassName}>{formatFieldLabel(alert.field)}</TableCell>
        <TableCell className={cellClassName}>{alert.value}</TableCell>
        <TableCell className={cellClassName}>{getStatusBadge(alert.status, t)}</TableCell>
        <TableCell className={cellClassName}>{getSeverityBadge(alert.severity, t)}</TableCell>
        <TableCell className={cellClassName}>{formatTimestamp(alert.timestamp)}</TableCell>
        <TableCell className={cellClassName}>{formatUser(alert.acknowledgedBy)}</TableCell>
        <TableCell className={cellClassName}>{formatUser(alert.resolvedBy)}</TableCell>
        <TableCell className={`text-right ${cellClassName}`.trim()}>
          <div className="flex items-center justify-end gap-2">
            {renderPrimaryActions(alert, actionHandlers, t)}
            {hasSecondaryActions ? renderSecondaryActions(alert, actionHandlers) : null}
          </div>
        </TableCell>
      </>
    )
  }

  const renderCard = (alert: Alert) => {
    const rowClassName = getRowClassName(alert)
    const isResolved = alert.status === AlertStatus.Resolved
    const textClassName = isResolved ? 'text-muted-foreground' : ''
    const details = [
      { label: t.pages.alerts.field ?? 'Parameter', value: formatFieldLabel(alert.field) },
      { label: t.pages.alerts.value, value: alert.value },
      { label: t.pages.alerts.timestamp, value: formatTimestamp(alert.timestamp) },
      { label: t.pages.alerts.acknowledgedBy, value: formatUser(alert.acknowledgedBy) },
      { label: t.pages.alerts.resolvedBy, value: formatUser(alert.resolvedBy) },
    ]

    return (
      <Card
        className={cn(
          'gap-0 overflow-hidden border border-border/60 py-0 shadow-none',
          rowClassName,
        )}
      >
        <CardContent className="px-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className={cn('min-w-0', textClassName)}>
                <p className="break-words text-base font-semibold">{alert.sensorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatFieldLabel(alert.field)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(alert.status, t)}
                {getSeverityBadge(alert.severity, t)}
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-lg border border-border/50 bg-background/80 px-3 py-2"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd className={cn('mt-1 break-words text-sm', textClassName)}>
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </CardContent>

        {hasAnyActions(alert, hasSecondaryActions) ? (
          <CardFooter className="flex-col items-stretch gap-3 border-t border-border/50 px-4 py-4">
            {renderPrimaryActions(alert, actionHandlers, t, true)}
            {hasSecondaryActions ? (
              <div className="flex items-center justify-end gap-2">
                {renderSecondaryActions(alert, actionHandlers)}
              </div>
            ) : null}
          </CardFooter>
        ) : null}
      </Card>
    )
  }

  return { renderRow, renderCard }
}