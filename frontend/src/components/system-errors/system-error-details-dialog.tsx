'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorSourceBadge } from '@/components/ui/error-source-badge'
import { ErrorTypeBadge } from '@/components/ui/error-type-badge'
import { ErrorReportSeverityBadge } from '@/components/error-reports/error-report-severity-badge'
import { SystemError } from '@/generated/graphql'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface SystemErrorDetailsDialogProps {
  error: SystemError | null
  open: boolean
  onClose: () => void
  onResolve?: (errorId: string, resolutionNotes?: string) => Promise<void>
  isResolving?: boolean
}

export function SystemErrorDetailsDialog({ 
  error, 
  open, 
  onClose, 
  onResolve,
  isResolving = false 
}: SystemErrorDetailsDialogProps) {
  if (!error) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {error.isResolved ? (
              <Badge variant="secondary" className="text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Open
              </Badge>
            )}
            {!error.isResolved && onResolve && (
              <Button onClick={() => onResolve(error.id)} disabled={isResolving} size="sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isResolving ? 'Resolving...' : 'Resolve'}
              </Button>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <h3 className="font-medium text-red-800 mb-2">Error Message</h3>
            <p className="text-sm font-mono text-red-700">{error.errorMessage}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Type</div>
              <ErrorTypeBadge errorType={error.errorType} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Source</div>
              <ErrorSourceBadge source={error.source} />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Severity</div>
              <ErrorReportSeverityBadge severity={error.severity} />
            </div>
          </div>

          {(error.component || error.action) && (
            <div className="space-y-2">
              {error.component && (
                <div className="text-sm">
                  <span className="font-medium">Component:</span> {error.component}
                </div>
              )}
              {error.action && (
                <div className="text-sm">
                  <span className="font-medium">Action:</span> {error.action}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">User/Tenant</div>
              <div className="text-gray-600">
                {error.user ? (
                  <span>{error.user.firstName} {error.user.lastName}</span>
                ) : error.tenant ? (
                  <span>{error.tenant.name}</span>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1">Frequency</div>
              <div className="text-gray-600">
                {error.occurrenceCount || 1} occurrence{(error.occurrenceCount || 1) > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>ID: {error.id}</div>
            <div>Created: {formatDistanceToNow(new Date(error.createdAt))} ago</div>
            {error.lastOccurredAt && (
              <div>Last occurred: {formatDistanceToNow(new Date(error.lastOccurredAt))} ago</div>
            )}
            {error.updatedAt && (
              <div>Updated: {formatDistanceToNow(new Date(error.updatedAt))} ago</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}