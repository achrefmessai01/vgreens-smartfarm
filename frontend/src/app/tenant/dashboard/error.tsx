'use client'

import ErrorPage from '@/components/ui/error-page'
import { Layout } from 'lucide-react'

export default function DashboardErrorPage({
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
      title="Dashboard Error"
      description="Something went wrong with the dashboard. Try reloading or access other farm sections."
      sectionName="Dashboard"
      theme="blue"
      resetLabel="Reload Dashboard"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Layout
      }}
    />
  )
}