'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useClerk } from '@clerk/nextjs';
import { Building2, LogOut, Moon, Shield, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const { user, role, isVGreensAdmin } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: '/login' });
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return t.common.admin || 'User';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0,
      )}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getRoleLabel = () => {
    switch (role) {
      case UserRole.VgreensAdmin:
        return t.pages.admin.users.roleVgreensAdmin;
      case UserRole.TenantAdmin:
        return t.pages.admin.users.roleTenantAdmin;
      case UserRole.TenantUser:
        return t.pages.admin.users.roleTenantUser;
      default:
        return t.pages.admin.users.notAvailable;
    }
  };

  const getTenantName = () => {
    // Type assertion needed until GraphQL types are regenerated
    const userWithTenant = user as typeof user & { tenant?: { name: string } };
    return userWithTenant?.tenant?.name || t.pages.admin.users.notAvailable;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`focus:ring-ring flex cursor-pointer items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none ${className}`}
          aria-label={t.common.settings || 'User menu'}
        >
          <Avatar className="border-border h-8 w-8 cursor-pointer border-2">
            {user?.imageUrl ? (
              <AvatarImage
                src={user.imageUrl}
                alt={getUserDisplayName()}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Section */}
        <DropdownMenuLabel className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-semibold">
              {getUserDisplayName()}
            </span>
          </div>
          {user?.email && (
            <span className="text-muted-foreground ml-6 text-xs">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Role Section */}
        <div className="px-2 py-1.5">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>{getRoleLabel()}</span>
          </div>
        </div>

        {/* Organization/Tenant Section */}
        {!isVGreensAdmin && user?.tenantId && (
          <>
            <div className="px-2 py-1.5">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Building2 className="h-3.5 w-3.5" />
                <span>{getTenantName()}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="cursor-pointer"
        >
          <div className="relative mr-2 h-4 w-4">
            <Moon className="absolute inset-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Sun className="absolute inset-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </div>
          <span>
            {theme === 'dark' ? t.common.darkMode : t.common.lightMode}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.common.logout || 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
