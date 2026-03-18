import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorReportSeverityBadge, ErrorReportStatusBadge } from '@/components/error-reports'
import { ReportSeverity, ReportStatus } from '@/types/error-types'
import { Clock, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface SystemErrorData {
  id: string
  source: string
  errorType: string
  severity: ReportSeverity
  errorMessage: string
  component?: string | null
  action?: string | null
  occurrenceCount?: number | null
  isResolved: boolean
  createdAt: string
  lastOccurredAt?: string | null
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null
  tenant?: { name: string } | null
}

interface SystemErrorCardProps {
  error: SystemErrorData
  onResolve: (id: string) => void
}

export function SystemErrorCard({ error, onResolve }: SystemErrorCardProps) {
  const isCritical = error.severity === 'CRITICAL' || error.severity === 'URGENT'

  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        isCritical
          ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ErrorReportSeverityBadge severity={error.severity} />
            <Badge variant="outline">{error.source}</Badge>
            <Badge variant="outline">{error.errorType}</Badge>
            {error.occurrenceCount && error.occurrenceCount > 1 && (
              <Badge variant="destructive">{error.occurrenceCount}x</Badge>
            )}
            <ErrorReportStatusBadge 
              status={error.isResolved ? ReportStatus.Resolved : ReportStatus.Open} 
              showIcon 
            />
          </div>

          <h3 className="font-medium text-sm">{error.errorMessage}</h3>

          <div className="text-xs text-muted-foreground space-y-1">
            {error.component && <p>Component: {error.component}</p>}
            {error.action && <p>Action: {error.action}</p>}
            {error.user && (error.user.firstName || error.user.lastName || error.user.email) && (
              <p>
                User: {error.user.firstName || ''} {error.user.lastName || ''} 
                {error.user.email && ` (${error.user.email})`}
              </p>
            )}
            {error.tenant && <p>Tenant: {error.tenant.name}</p>}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                First: {formatDistanceToNow(new Date(error.createdAt))} ago
              </span>
              {error.lastOccurredAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {formatDistanceToNow(new Date(error.lastOccurredAt))} ago
                </span>
              )}
            </div>
          </div>
        </div>

        {!error.isResolved && (
          <Button
            size="sm"
            onClick={() => onResolve(error.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}