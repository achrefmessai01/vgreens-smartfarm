'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { AppLayout } from '@/components/layout'
import { useRouter, usePathname } from 'next/navigation'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      if (pathname !== '/login') {
        router.replace('/login')
      }
      return
    }

    if (loading) {
      return
    }
    // VgreensAdmin is allowed to access tenant routes as well,
    // so we intentionally do not redirect them away from /tenant here.
  }, [isSignedIn, isLoaded, router, pathname, loading])

  if (!isLoaded || !isSignedIn || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <AppLayout user={user || undefined}>{children}</AppLayout>
}
