'use client'

import ErrorPage from '@/components/ui/error-page'
import { Users } from 'lucide-react'

export default function UsersErrorPage({
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
      title="Users Section Error"
      description="Something went wrong with the users section. Your other farm sections are still working."
      sectionName="Users"
      theme="emerald"
      resetLabel="Reload Users"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Users
      }}
    />
  )
}
