'use client'

import * as React from 'react'
import {
  UserStatus,
  useUsersQuery,
  useTenantsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/generated/graphql'
import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetFooter,
  SheetContent,
} from '@/components/ui/sheet'
import { useI18n } from '@/i18n'
import {
  UserManagementForm,
  type UserFormData,
  type UserManagementFormRef,
} from '@/components/users/user-management-form'
import { UserRole } from '@/generated/graphql'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { ConfirmationDialog } from '@/components/users'
import type { User, Tenant } from '@/generated/graphql'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { UserManagementTable } from '@/components/users/user-management-table'

export default function AdminUsersPage() {
  const { t } = useI18n()
  const { role: currentUserRole } = useCurrentUser()
  const isVGreensAdmin = currentUserRole === UserRole.VgreensAdmin

  const {
    data: usersData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useUsersQuery()
  const { data: tenantsData, loading: tenantsLoading } = useTenantsQuery({
    skip: !isVGreensAdmin,
  })

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

  const users = (usersData?.users || []) as User[]
  const tenants = (tenantsData?.tenants || []) as Tenant[]

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
        await refetchUsers()
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
        await refetchUsers()
        setIsSheetOpen(false)
        setEditingUser(null)
      } else {
        // Create user - will send invitation
        const result = await createUser({
          variables: {
            input: {
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              imageUrl: formData.imageUrl,
              role: formData.role,
              tenantId: formData.tenantId,
            },
          },
        })

        await refetchUsers()
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

  if (usersLoading || tenantsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{t.pages.admin.users.loading}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.admin.users.title}
        subtitle={t.pages.admin.users.subtitle}
      />

      <UserManagementTable
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col p-0 gap-0"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b dark:border-primary-foreground/30">
            <SheetTitle className="dark:text-card-foreground">
              {editingUser
                ? t.pages.admin.users.editUser
                : t.pages.admin.users.createUser}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <UserManagementForm
              ref={formRef}
              initialData={editingUser || undefined}
              tenants={tenants}
              isVGreensAdmin={isVGreensAdmin}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>

          <SheetFooter className="flex-row gap-2 px-6 py-4 border-t dark:border-primary-foreground/30">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 dark:border-primary-foreground/30 dark:hover:bg-primary-foreground/10"
            >
              {t.pages.users.cancel}
            </Button>
            <Button
              onClick={() => formRef.current?.submit()}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? '...'
                : editingUser
                ? t.pages.admin.users.updateUser
                : t.pages.admin.users.createUser}
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
        title={t.pages.admin.users.deleteUser}
        description={t.pages.users.confirmDeleteDescription}
        confirmLabel={t.pages.users.delete}
        cancelLabel={t.pages.users.cancel}
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmation({ user: null, isOpen: false })}
      >
        {deleteConfirmation.user && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg dark:bg-primary-foreground/10 dark:border dark:border-primary-foreground/20">
              <p className="font-medium dark:text-card-foreground">
                {[
                  deleteConfirmation.user.firstName,
                  deleteConfirmation.user.lastName,
                ]
                  .filter(Boolean)
                  .join(' ') || t.pages.admin.users.notAvailable}
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
