'use client'

import ErrorPage from '@/components/ui/error-page'
import { Camera } from 'lucide-react'

export default function CameraErrorPage({
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
      title="Camera Stream Error"
      description="Something went wrong with the camera livestream. Your other farm sections are still working."
      sectionName="Camera"
      theme="purple"
      resetLabel="Reconnect Camera"
      backLink={{
        href: "/tenant/dashboard",
        label: "Back to Dashboard",
        icon: Camera
      }}
    />
  )
}