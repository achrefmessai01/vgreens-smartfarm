'use client'

import ErrorPage from '@/components/ui/error-page'
import { RotateCcw } from 'lucide-react'

export default function SystemErrorsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="System Errors Load Failed"
      description="Unable to load the system errors page. This might be due to a network issue or server problem."
      sectionName="System Errors"
      theme="red"
      backLink={{
        href: '/admin/dashboard',
        label: 'Back to Dashboard',
        icon: RotateCcw,
      }}
      resetLabel="Retry Loading"
    />
  )
}