'use client'

import { useI18n } from '@/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import { Alert, AlertStatus } from '@/generated/graphql'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { DataTable, type Column } from '@/components/ui/data-table'
import { usePaginationConfig } from '@/lib/hooks/use-pagination-config'

interface AlertTableProps {
  alerts: Alert[]
  onAcknowledge: (alert: Alert) => void
  onResolve: (alert: Alert) => void
  onEdit?: (alert: Alert) => void
  onDelete?: (alert: Alert) => void
  isLoading?: boolean
}

export function AlertTable({
  alerts,
  onAcknowledge,
  onResolve,
  onEdit,
  onDelete,
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

    return (
      <>
        <TableCell className="font-medium">{alert.sensorName}</TableCell>
        <TableCell>{alert.value}</TableCell>
        <TableCell>{getStatusBadge(alert.status)}</TableCell>
        <TableCell>
          <Badge variant="destructive">{t.pages.alerts.critical}</Badge>
        </TableCell>
        <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {canAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert)}
                disabled={isLoading}
              >
                {t.pages.alerts.acknowledge}
              </Button>
            )}
            {canResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResolve(alert)}
                disabled={isLoading}
              >
                {t.pages.alerts.resolve}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(alert)}
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
                onClick={() => onDelete(alert)}
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
      defaultPageSize={paginationConfig.defaultPageSize}
      pageSizeOptions={paginationConfig.pageSizeOptions}
      paginationLabels={paginationConfig.paginationLabels}
    />
  )
}
