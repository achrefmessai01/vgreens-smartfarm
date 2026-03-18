import { ReportStatus, ReportSeverity } from '@/generated/graphql'
import { AlertCircle, Clock, Check } from 'lucide-react'

// Date formatting utilities
export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit', 
    year: 'numeric'
  }).format(dateObj)
}

export const formatDateTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj)
}

// Status configuration
export const getStatusConfig = (status: ReportStatus) => {
  const configs = {
    [ReportStatus.Open]: { 
      variant: 'secondary' as const, 
      icon: AlertCircle, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    [ReportStatus.InProgress]: { 
      variant: 'outline' as const, 
      icon: Clock, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    [ReportStatus.Resolved]: { 
      variant: 'default' as const, 
      icon: Check, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  }
  
  return configs[status]
}

// Severity configuration
export const getSeverityConfig = (severity: ReportSeverity) => {
  const configs = {
    [ReportSeverity.Low]: { 
      variant: 'outline' as const, 
      color: 'text-gray-600',
    },
    [ReportSeverity.Medium]: { 
      variant: 'secondary' as const, 
      color: 'text-blue-600',
    },
    [ReportSeverity.High]: { 
      variant: 'destructive' as const, 
      color: 'text-orange-600',
    },
    [ReportSeverity.Critical]: { 
      variant: 'destructive' as const, 
      color: 'text-red-600',
    },
    [ReportSeverity.Urgent]: { 
      variant: 'destructive' as const, 
      color: 'text-red-700',
    },
  }
  
  return configs[severity]
}

// Status timeline helper
export const getTimelineStatus = (currentStatus: ReportStatus, targetStatus: ReportStatus) => {
  const statusOrder = {
    [ReportStatus.Open]: 0,
    [ReportStatus.InProgress]: 1,
    [ReportStatus.Resolved]: 2,
  }
  
  const currentOrder = statusOrder[currentStatus]
  const targetOrder = statusOrder[targetStatus]
  
  return currentOrder >= targetOrder ? 'completed' : 'pending'
}