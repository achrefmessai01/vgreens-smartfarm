'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlagIcon } from '@/components/ui/flag-icon';
import { UserRole } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import { locales, localeNativeNames } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useLogout } from '@/lib/hooks/use-logout';
import {
  Building2,
  Check,
  Globe,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { t, locale, setLocale } = useI18n();
  const handleLogout = useLogout();
  const { theme, setTheme } = useTheme();
  const { user, role, isVGreensAdmin } = useCurrentUser();

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
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {getUserInitials()}
              </AvatarFallback>
            )}
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
          <div className="text-muted-foreground mt-1 ml-6 flex items-center gap-1.5 text-xs font-normal">
            <Shield className="h-3 w-3" />
            <span>{getRoleLabel()}</span>
          </div>
          {!isVGreensAdmin && user?.tenantId && (
            <div className="text-muted-foreground ml-6 flex items-center gap-1.5 text-xs font-normal">
              <Building2 className="h-3 w-3" />
              <span>{getTenantName()}</span>
            </div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Preferences */}
        <DropdownMenuLabel className="text-muted-foreground px-2 py-1 text-xs font-normal">
          {t.common.preferences}
        </DropdownMenuLabel>

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="cursor-pointer"
        >
          <div className="relative h-4 w-4 shrink-0">
            <Moon className="absolute inset-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Sun className="absolute inset-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </div>
          <span>
            {theme === 'dark' ? t.common.darkMode : t.common.lightMode}
          </span>
        </DropdownMenuItem>

        {/* Language Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer" chevron={false}>
            <Globe className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t.common.language}</span>
            <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
              <FlagIcon locale={locale} className="h-3.5 w-3.5" />
              {localeNativeNames[locale]}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={8}
            className="max-h-[60vh] min-w-48 overflow-y-auto p-1"
          >
            {locales.map((loc) => {
              const isActive = locale === loc;
              return (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 py-2 pl-2 pr-2',
                    isActive && 'bg-accent/60',
                  )}
                  dir={loc === 'ar' ? 'rtl' : 'ltr'}
                >
                  <FlagIcon locale={loc} className="h-4 w-4 shrink-0" />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      isActive && 'font-medium',
                    )}
                  >
                    {localeNativeNames[loc]}
                  </span>
                  {isActive && (
                    <Check className="text-primary h-4 w-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

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
