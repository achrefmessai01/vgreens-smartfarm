'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import {
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Pencil,
  Trash2,
} from 'lucide-react'
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

type StatusFilter = AlertStatus | 'all'

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
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')

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
          <Badge
            variant="outline"
            className="gap-1 border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <CheckCircle2 className="h-3 w-3" />
            {t.pages.alerts.statusAcknowledged}
          </Badge>
        )
      case AlertStatus.Resolved:
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {t.pages.alerts.statusResolved}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.Critical:
        return <Badge variant="destructive">{t.pages.alerts.critical}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getRowClassName = (alert: Alert) => {
    if (alert.status === AlertStatus.Resolved) {
      return 'bg-emerald-50/70 dark:bg-emerald-950/30'
    }

    if (alert.status === AlertStatus.Acknowledged) {
      return 'bg-amber-50/60 dark:bg-amber-950/20'
    }

    if (
      alert.status === AlertStatus.Open &&
      alert.severity === AlertSeverity.Critical
    ) {
      return 'bg-red-50/80 dark:bg-red-950/40'
    }

    return ''
  }

  const formatTimestamp = (timestamp?: Alert['timestamp'] | null) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString()
  }

  const getTimestampMs = (timestamp?: Alert['timestamp'] | null) => {
    if (!timestamp) return 0
    const time = new Date(timestamp).getTime()
    return Number.isNaN(time) ? 0 : time
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

  const sortedAlerts = React.useMemo(
    () =>
      [...alerts].sort(
        (a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp)
      ),
    [alerts]
  )

  const filteredAlerts = React.useMemo(() => {
    if (statusFilter === 'all') {
      return sortedAlerts
    }

    return sortedAlerts.filter((alert) => alert.status === statusFilter)
  }, [sortedAlerts, statusFilter])

  const hideEditButton = true

  const renderRow = (alert: Alert) => {
    const canAcknowledge =
      alert.status === AlertStatus.Open && alert.acknowledgedBy == null
    const canResolve =
      (alert.status === AlertStatus.Open ||
        alert.status === AlertStatus.Acknowledged) &&
      alert.resolvedBy == null &&
      alert.acknowledgedBy != null

    const rowClassName = getRowClassName(alert)
    const isResolved = alert.status === AlertStatus.Resolved
    const textClassName = isResolved ? 'text-muted-foreground' : ''
    const cellClassName = `${rowClassName} ${textClassName}`.trim()

    const formatUser = (user?: Alert['acknowledgedBy']) => {
      if (!user) return '-'
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
      return name || user.email || '-'
    }

    return (
      <>
        <TableCell className={`font-medium ${cellClassName}`.trim()}>
          {alert.sensorName}
        </TableCell>
        <TableCell className={cellClassName}>{alert.value}</TableCell>
        <TableCell className={cellClassName}>
          {getStatusBadge(alert.status)}
        </TableCell>
        <TableCell className={cellClassName}>
          {getSeverityBadge(alert.severity)}
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
                className="gap-1.5"
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
            {onEdit && !hideEditButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(alert)
                }}
                disabled={isLoading}
                className="h-8 w-8 rounded-full border border-sky-200/80 text-sky-700 hover:bg-sky-100 hover:text-sky-800 dark:border-sky-900/70 dark:text-sky-300 dark:hover:bg-sky-950/40"
              >
                <Pencil className="h-4 w-4" />
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
                className="h-8 w-8 rounded-full border border-rose-200/80 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </>
    )
  }

  return (
    <DataTable
      data={filteredAlerts}
      columns={columns}
      renderRow={renderRow}
      onRowClick={onRowClick}
      filterConfig={{
        label: t.pages.alerts.filterByStatus,
        value: statusFilter,
        options: [
          { label: t.pages.alerts.allStatuses, value: 'all' },
          { label: t.pages.alerts.statusOpen, value: AlertStatus.Open },
          {
            label: t.pages.alerts.statusAcknowledged,
            value: AlertStatus.Acknowledged,
          },
          { label: t.pages.alerts.statusResolved, value: AlertStatus.Resolved },
        ],
        onFilterChange: (value) => setStatusFilter(value as StatusFilter),
      }}
      emptyState={{
        title: t.pages.alerts.noAlerts,
        description: t.pages.alerts.noAlertsDescription,
      }}
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
    />
  )
}
