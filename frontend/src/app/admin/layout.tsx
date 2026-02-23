'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UserRole } from '@/generated/graphql'
import { AppLayout } from '@/components/layout'
import { useRouter, usePathname } from 'next/navigation'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, loading } = useCurrentUser()

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

    if (role && role !== UserRole.VgreensAdmin) {
      if (!pathname?.startsWith('/tenant')) {
        router.replace('/tenant/dashboard')
      }
      return
    }
  }, [isSignedIn, isLoaded, router, pathname, role, loading])

  if (!isLoaded || !isSignedIn || loading) {
    return <PageSkeleton />
  }

  if (role !== UserRole.VgreensAdmin) {
    return null
  }

  return <AppLayout user={user || undefined}>{children}</AppLayout>
}
