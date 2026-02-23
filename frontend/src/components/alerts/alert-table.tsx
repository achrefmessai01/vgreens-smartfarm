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
import {
  DataTable,
  type Column,
  type FilterConfigOption,
} from '@/components/ui/data-table'
import { Alert, AlertStatus, AlertSeverity, User } from '@/generated/graphql'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'
import type { AlertsFilterInput } from '@/lib/types/alerts-filter'

export type AlertTableUser = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email'
>

interface AlertTableProps {
  alerts: Alert[]
  filter: AlertsFilterInput
  onFilterChange: (updates: Partial<AlertsFilterInput>) => void
  users: AlertTableUser[]
  onAcknowledge: (alert: Alert) => void
  onResolve: (alert: Alert) => void
  onEdit?: (alert: Alert) => void
  onDelete?: (alert: Alert) => void
  onRowClick?: (alert: Alert) => void
  isLoading?: boolean
  tableLoading?: boolean
}

export function AlertTable({
  alerts,
  filter,
  onFilterChange,
  users,
  onAcknowledge,
  onResolve,
  onEdit,
  onDelete,
  onRowClick,
  isLoading = false,
  tableLoading = false,
}: AlertTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()

  const alertsT = t.pages.alerts as typeof t.pages.alerts & {
    searchPlaceholder?: string
    filterBySeverity?: string
    allSeverities?: string
    filterByAcknowledgedBy?: string
    filterByResolvedBy?: string
    dateRangePlaceholder?: string
    allUsers?: string
  }

  const userOptionsForMulti = React.useMemo(
    () =>
      users.map((u) => {
        const name =
          [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.id
        return { label: name, value: u.id }
      }),
    [users],
  )

  const filterConfigs: FilterConfigOption[] = React.useMemo(
    () => [
      {
        label: alertsT.filterByStatus,
        value: filter.statusIn?.length ? filter.statusIn.join(',') : '',
        options: [
          { label: alertsT.statusOpen, value: AlertStatus.Open },
          {
            label: alertsT.statusAcknowledged,
            value: AlertStatus.Acknowledged,
          },
          { label: alertsT.statusResolved, value: AlertStatus.Resolved },
        ],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            status: undefined,
            statusIn: value
              ? (value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean) as AlertStatus[])
              : undefined,
          }),
      },
      {
        label: alertsT.filterBySeverity ?? 'Severity',
        value: filter.severityIn?.length ? filter.severityIn.join(',') : '',
        options: [{ label: alertsT.critical, value: AlertSeverity.Critical }],
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            severity: undefined,
            severityIn: value
              ? (value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean) as AlertSeverity[])
              : undefined,
          }),
      },
      {
        label: alertsT.filterByAcknowledgedBy ?? 'Acknowledged by',
        value: filter.acknowledgedByIdIn?.length
          ? filter.acknowledgedByIdIn.join(',')
          : '',
        options: userOptionsForMulti,
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            acknowledgedById: undefined,
            acknowledgedByIdIn: value
              ? value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
              : undefined,
          }),
      },
      {
        label: alertsT.filterByResolvedBy ?? 'Resolved by',
        value: filter.resolvedByIdIn?.length
          ? filter.resolvedByIdIn.join(',')
          : '',
        options: userOptionsForMulti,
        multiSelect: true,
        onFilterChange: (value) =>
          onFilterChange({
            resolvedById: undefined,
            resolvedByIdIn: value
              ? value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
              : undefined,
          }),
      },
    ],
    [
      filter.statusIn,
      filter.severityIn,
      filter.acknowledgedByIdIn,
      filter.resolvedByIdIn,
      userOptionsForMulti,
      onFilterChange,
      alertsT,
    ],
  )

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
        (a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp),
      ),
    [alerts],
  )

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
      data={sortedAlerts}
      columns={columns}
      renderRow={renderRow}
      onRowClick={onRowClick}
      searchConfig={{
        placeholder:
          alertsT.searchPlaceholder ??
          'Search by sensor name, acknowledged by, resolved by...',
      }}
      searchValue={filter.search ?? ''}
      onSearchChange={(value) => onFilterChange({ search: value || undefined })}
      filterConfigs={filterConfigs}
      dateRangeConfig={{
        dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : null,
        dateTo: filter.dateTo ? new Date(filter.dateTo) : null,
        onRangeChange: (from, to) =>
          onFilterChange({
            dateFrom: from?.toISOString().slice(0, 10) ?? undefined,
            dateTo: to?.toISOString().slice(0, 10) ?? undefined,
          }),
        placeholder: alertsT.dateRangePlaceholder ?? 'Select date range',
      }}
      emptyState={{
        title: t.pages.alerts.noAlerts,
        description: t.pages.alerts.noAlertsDescription,
      }}
      isLoading={tableLoading}
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
    />
  )
}
