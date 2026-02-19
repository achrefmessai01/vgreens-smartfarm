'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Alert, AlertStatus, AlertSeverity } from '@/generated/graphql'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface AlertTableProps {
  alerts: Alert[]
  onAcknowledge: (alert: Alert) => void
  onResolve: (alert: Alert) => void
  onEdit?: (alert: Alert) => void
  onDelete?: (alert: Alert) => void
  onRowClick?: (alert: Alert) => void
  isLoading?: boolean
}

export function AlertTable({
  alerts,
  onAcknowledge,
  onResolve,
  onEdit,
  onDelete,
  onRowClick,
  isLoading = false,
}: AlertTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.Open:
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t.pages.alerts.statusOpen}
          </Badge>
        )
      case AlertStatus.Acknowledged:
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t.pages.alerts.statusAcknowledged}
          </Badge>
        )
      case AlertStatus.Resolved:
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t.pages.alerts.statusResolved}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns: Column<Alert>[] = [
    { key: 'sensorName', header: t.pages.alerts.sensorName },
    { key: 'value', header: t.pages.alerts.value },
    { key: 'status', header: t.pages.alerts.status },
    { key: 'severity', header: t.pages.alerts.severity },
    { key: 'timestamp', header: t.pages.alerts.timestamp },
    { key: 'acknowledgedBy', header: t.pages.alerts.acknowledgedBy },
    { key: 'resolvedBy', header: t.pages.alerts.resolvedBy },
    {
      key: 'actions',
      header: t.pages.alerts.actions,
      headerClassName: 'text-right',
    },
  ]

  const renderRow = (alert: Alert) => {
    const canAcknowledge = alert.status === AlertStatus.Open
    const canResolve =
      alert.status === AlertStatus.Open ||
      alert.status === AlertStatus.Acknowledged

    const isCriticalOpen =
      alert.status === AlertStatus.Open &&
      alert.severity === AlertSeverity.Critical
    const rowClassName = isCriticalOpen ? 'bg-red-50/80 dark:bg-red-950/40' : ''

    const formatUser = (user?: Alert['acknowledgedBy']) => {
      if (!user) return '—'
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
      return name || user.email || '—'
    }

    return (
      <>
        <TableCell className={`font-medium ${rowClassName}`}>
          {alert.sensorName}
        </TableCell>
        <TableCell className={rowClassName}>{alert.value}</TableCell>
        <TableCell className={rowClassName}>
          {getStatusBadge(alert.status)}
        </TableCell>
        <TableCell className={rowClassName}>
          <Badge variant="destructive">{t.pages.alerts.critical}</Badge>
        </TableCell>
        <TableCell className={rowClassName}>
          {new Date(alert.timestamp).toLocaleString()}
        </TableCell>
        <TableCell className={rowClassName}>
          {formatUser(alert.acknowledgedBy)}
        </TableCell>
        <TableCell className={rowClassName}>
          {formatUser(alert.resolvedBy)}
        </TableCell>
        <TableCell className={`text-right ${rowClassName}`}>
          <div className="flex justify-end gap-2">
            {canAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAcknowledge(alert)
                }}
                disabled={isLoading}
              >
                {t.pages.alerts.acknowledge}
              </Button>
            )}
            {canResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onResolve(alert)
                }}
                disabled={isLoading}
              >
                {t.pages.alerts.resolve}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(alert)
                }}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(alert)
                }}
                disabled={isLoading}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </>
    )
  }

  return (
    <DataTable
      data={alerts}
      columns={columns}
      renderRow={renderRow}
      onRowClick={onRowClick}
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
    />
  )
}
