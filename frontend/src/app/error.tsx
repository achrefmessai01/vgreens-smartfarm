'use client'

import ErrorPage from '@/components/ui/error-page'
import { Home } from 'lucide-react'

export default function AppErrorPage({
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
      title="Something went wrong!"
      description="An unexpected error occurred. Please try again or return to the homepage."
      theme="red"
      backLink={{
        href: "/",
        label: "Go Home",
        icon: Home
      }}
    />
  )
}