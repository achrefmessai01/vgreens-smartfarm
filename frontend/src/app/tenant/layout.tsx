'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { UserRole } from '@/generated/graphql'
import { AppLayout } from '@/components/layout'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, loading } = useCurrentUser()

  useEffect(() => {
    // Wait for Clerk to finish loading before checking auth state
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      // Only redirect if not already on login page
      if (pathname !== '/login') {
        router.replace('/login')
      }
      return
    }

    // Wait for user data to load
    if (loading) {
      return
    }

    // If user is VGREENS_ADMIN, redirect to admin dashboard
    // Only redirect if we're sure about the role (not undefined) and not already on admin page
    if (role === UserRole.VgreensAdmin) {
      if (!pathname?.startsWith('/admin')) {
        router.replace('/admin/dashboard')
      }
      return
    }
  }, [isSignedIn, isLoaded, router, pathname, role, loading])

  // Show loading while Clerk or user data is loading
  if (!isLoaded || !isSignedIn || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // If admin, don't render (redirect will happen)
  if (role === UserRole.VgreensAdmin) {
    return null
  }

  return <AppLayout user={user || undefined}>{children}</AppLayout>
}
