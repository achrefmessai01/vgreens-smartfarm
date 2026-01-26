'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import type { Warning, WarningStatus } from '@/lib/warning-types'
import { DataTable, type Column } from '@/components/ui/data-table'
import { CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface WarningTableProps {
  warnings: Warning[]
  onAcknowledge: (warning: Warning) => void
  onResolve: (warning: Warning) => void
  isAlert?: boolean
}

export function WarningTable({
  warnings,
  onAcknowledge,
  onResolve,
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
              onClick={() => onAcknowledge(warning)}
              className="h-8 dark:border-border/50 dark:text-white dark:hover:bg-muted/70"
            >
              {translations.acknowledge}
            </Button>
          )}
          {warning.status !== 'resolved' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onResolve(warning)}
              className="h-8"
            >
              {translations.resolve}
            </Button>
          )}
        </div>
      </TableCell>
    </>
  )

  return (
    <DataTable
      data={filteredWarnings}
      columns={columns}
      renderRow={renderRow}
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
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
    />
  )
}
