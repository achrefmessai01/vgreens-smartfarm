'use client'

import ErrorPage from '@/components/ui/error-page'
import { Wheat } from 'lucide-react'

export default function HarvestErrorPage({
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
      title="Harvest Section Error"
      description="Something went wrong with the harvest section. Your other farm sections are still working."
      sectionName="Harvest"
      theme="yellow"
      resetLabel="Reload Harvest"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Wheat
      }}
    />
  )
}