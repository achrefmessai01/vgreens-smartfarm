'use client'

import ErrorPage from '@/components/ui/error-page'
import { Clock } from 'lucide-react'

export default function HistoryErrorPage({
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
      title="History Section Error"
      description="Something went wrong with the history section. Your other farm sections are still working."
      sectionName="History"
      theme="cyan"
      resetLabel="Reload History"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Clock
      }}
    />
  )
}