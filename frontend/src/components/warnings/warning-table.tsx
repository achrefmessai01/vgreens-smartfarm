'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import type { Warning, WarningStatus } from '@/lib/warning-types'
import { DataTable, type Column } from '@/components/ui/data-table'
import { CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface WarningTableProps {
  warnings: Warning[]
  onAcknowledge: (warning: Warning) => void
  onResolve: (warning: Warning) => void
  onRowClick?: (warning: Warning) => void
  isAlert?: boolean
}

export function WarningTable({
  warnings,
  onAcknowledge,
  onResolve,
  onRowClick,
  isAlert = false,
}: WarningTableProps) {
  const { t } = useI18n()
  const paginationConfig = usePaginationConfig()
  const [statusFilter, setStatusFilter] = React.useState<WarningStatus | 'all'>(
    'all'
  )

  const translations = isAlert ? t.pages.alerts : t.pages.warnings

  const filteredWarnings = React.useMemo(() => {
    if (statusFilter === 'all') {
      return warnings
    }
    return warnings.filter((warning) => warning.status === statusFilter)
  }, [warnings, statusFilter])

  const getStatusBadge = (status: WarningStatus) => {
    const statusConfig = {
      open: {
        label: translations.open,
        variant: 'destructive' as const,
        icon: AlertCircle,
      },
      acknowledged: {
        label: translations.acknowledged,
        variant: 'secondary' as const,
        icon: CheckCircle2,
      },
      resolved: {
        label: translations.resolved,
        variant: 'default' as const,
        icon: CheckCircle,
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const columns: Column<Warning>[] = [
    {
      key: 'sensorName',
      header: translations.sensorName,
    },
    {
      key: 'value',
      header: translations.value,
    },
    {
      key: 'timestamp',
      header: translations.timestamp,
    },
    {
      key: 'tunnel',
      header: translations.tunnel,
      headerClassName: 'hidden md:table-cell',
    },
    {
      key: 'status',
      header: translations.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
    },
  ]

  const renderRow = (warning: Warning) => (
    <>
      <TableCell className="font-medium dark:text-white">
        {warning.sensorName}
      </TableCell>
      <TableCell className="dark:text-gray-300">{warning.value}</TableCell>
      <TableCell className="dark:text-gray-300">
        {formatTimestamp(warning.timestamp)}
      </TableCell>
      <TableCell className="hidden md:table-cell dark:text-gray-300">
        {warning.tunnel}
      </TableCell>
      <TableCell>{getStatusBadge(warning.status)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {warning.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) =>  { e.stopPropagation(); onAcknowledge(warning); }}
              className="h-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
            >
              {translations.acknowledge}
            </Button>
          )}
          {warning.status !== 'resolved' && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onResolve(warning); }}
              className="h-8"
            >
              {translations.resolve}
            </Button>
          )}
        </div>
      </TableCell>
    </>
  )

  const renderCard = (warning: Warning) => (
    <Card className="gap-0 overflow-hidden border border-border/60 py-0 shadow-none">
      <CardContent className="space-y-4 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold dark:text-white">
              {warning.sensorName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {warning.value}
            </p>
          </div>
          <div>{getStatusBadge(warning.status)}</div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {translations.timestamp}
            </dt>
            <dd className="mt-1 text-sm dark:text-gray-300">
              {formatTimestamp(warning.timestamp)}
            </dd>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/80 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {translations.tunnel}
            </dt>
            <dd className="mt-1 text-sm dark:text-gray-300">
              {warning.tunnel || '-'}
            </dd>
          </div>
        </dl>
      </CardContent>

      {warning.status !== 'resolved' ? (
        <CardFooter className="flex-col items-stretch gap-2 border-t border-border/50 px-4 py-4 sm:flex-row sm:justify-end">
          {warning.status === 'open' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                onAcknowledge(warning)
              }}
              className="h-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
            >
              {translations.acknowledge}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              onResolve(warning)
            }}
            className="h-8"
          >
            {translations.resolve}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )

  return (
    <DataTable
      data={filteredWarnings}
      columns={columns}
      renderRow={renderRow}
      renderCard={renderCard}
      onRowClick={onRowClick}
      filterConfig={{
        label: translations.filterByStatus,
        value: statusFilter,
        options: [
          { label: translations.allStatuses, value: 'all' },
          { label: translations.open, value: 'open' },
          { label: translations.acknowledged, value: 'acknowledged' },
          { label: translations.resolved, value: 'resolved' },
        ],
        onFilterChange: (value) =>
          setStatusFilter(value as WarningStatus | 'all'),
      }}
      emptyState={{
        title: isAlert ? t.pages.alerts.noAlerts : t.pages.warnings.noWarnings,
        description: isAlert
          ? t.pages.alerts.noAlertsDescription
          : t.pages.warnings.noWarningsDescription,
      }}
      paginationVariant="compact"
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
      responsiveBreakpoint="xl"
    />
  )
}
