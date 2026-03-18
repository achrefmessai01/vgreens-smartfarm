'use client'

import ErrorPage from '@/components/ui/error-page'
import { Bell } from 'lucide-react'

export default function AlertsErrorPage({
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
      title="Alerts Section Error"
      description="Something went wrong with the alerts section. Your other farm sections are still working."
      sectionName="Alerts"
      theme="red"
      resetLabel="Reload Alerts"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Bell
      }}
    />
  )
}