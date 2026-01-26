'use client'

import * as React from 'react'
import { PageHeader } from '@/components/layout'
import {
  UserManagementTable,
  UserManagementForm,
  type UserManagementFormRef,
  type UserFormData,
} from '@/components/users'
import { ConfirmationDialog } from '@/components/users'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  UserRole,
  UserStatus,
} from '@/generated/graphql'
import type { User } from '@/generated/graphql'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

export default function TenantUsersPage() {
  const { user: currentUser } = useCurrentUser()
  const { data, loading, refetch } = useUsersQuery()
  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    user: User | null
    isOpen: boolean
  }>({ user: null, isOpen: false })
  const formRef = React.useRef<UserManagementFormRef>(null)

  // Filter users to only show users from the current tenant
  // The backend already filters by tenant, but we add an extra check here
  const tenantId = currentUser?.tenantId
  const users = React.useMemo(() => {
    if (!data?.users) return []
    // Filter to only show users from the current tenant
    return data.users.filter((user) => user.tenantId === tenantId) as User[]
  }, [data?.users, tenantId])

  const handleCreate = () => {
    setEditingUser(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsSheetOpen(true)
  }

  const handleDelete = (user: User) => {
    setDeleteConfirmation({ user, isOpen: true })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.user) {
      setIsLoading(true)
      try {
        await deleteUser({
          variables: { id: deleteConfirmation.user.id },
        })
        await refetch()
        setDeleteConfirmation({ user: null, isOpen: false })
      } catch (error) {
        console.error('Error deleting user:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (formData: UserFormData) => {
    setIsLoading(true)
    try {
      if (editingUser) {
        await updateUser({
          variables: {
            id: editingUser.id,
            input: formData,
          },
        })
        await refetch()
        setIsSheetOpen(false)
        setEditingUser(null)
      } else {
        // Create user - will send invitation
        // Tenant users can only create users for their own tenant
        const result = await createUser({
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              imageUrl: formData.imageUrl,
              role: formData.role,
              tenantId: tenantId, // Always use current tenant's ID
            },
          },
        })

        await refetch()
        setIsSheetOpen(false)
        setEditingUser(null)

        // Show success message with invitation info
        if (result.data?.createUser) {
          // Invitation URL is stored in metadata but not exposed in GraphQL schema
          // You can check the user status to know if invitation was sent
          if (result.data.createUser.status === UserStatus.Pending) {
            // You can show a toast or alert here
            console.log('User created with pending invitation')
          }
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      // You can show error toast here
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
    setEditingUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage users for your tenant"
      />

      <UserManagementTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
        hideTenantColumn={true}
      />

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
            <SheetTitle className="dark:text-card-foreground">
              {editingUser ? 'Edit User' : 'Create User'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <UserManagementForm
              ref={formRef}
              initialData={editingUser || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
              // Tenant users can only create TENANT_USER or TENANT_ADMIN roles
              allowedRoles={[UserRole.TenantUser, UserRole.TenantAdmin]}
              // Hide tenant selection - always use current tenant
              hideTenantSelection={true}
            />
          </div>

          <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => formRef.current?.submit()}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '...' : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({ user: null, isOpen: open })
        }
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation({ user: null, isOpen: false })}
      >
        {deleteConfirmation.user && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
              <p className="font-medium dark:text-card-foreground">
                {deleteConfirmation.user.firstName &&
                deleteConfirmation.user.lastName
                  ? `${deleteConfirmation.user.firstName} ${deleteConfirmation.user.lastName}`
                  : deleteConfirmation.user.email || 'Unknown User'}
              </p>
              {deleteConfirmation.user.email && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 mt-1">
                  {deleteConfirmation.user.email}
                </p>
              )}
            </div>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  )
}
