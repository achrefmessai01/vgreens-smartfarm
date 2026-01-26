'use client'

import { useMeQuery } from '@/generated/graphql'
import { UserRole } from '@/generated/graphql'

export function useCurrentUser() {
  const { data, loading, error } = useMeQuery({
    fetchPolicy: 'network-only',
  })

  const user = data?.me
  const role = user?.role as UserRole | undefined

  const isVGreensAdmin = role === UserRole.VgreensAdmin
  const isTenantAdmin = role === UserRole.TenantAdmin
  const isTenantUser = role === UserRole.TenantUser

  return {
    user,
    role,
    loading,
    error,
    isVGreensAdmin,
    isTenantAdmin,
    isTenantUser,
  }
}
