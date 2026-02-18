import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { ChevronRight, LogOut, Moon, Sun, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarContentProps {
  mobile?: boolean
  isCollapsed: boolean
  pathname: string
  navItems: NavItem[]
  defaultUser: { name: string; role: string; avatar?: string }
  t: ReturnType<typeof useI18n>['t']
  theme: string | undefined
  setTheme: (theme: string) => void
  onLogout?: () => void
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function SidebarContent({
  mobile = false,
  isCollapsed,
  pathname,
  navItems,
  defaultUser,
  t,
  theme,
  setTheme,
  onLogout,
  onToggleCollapse,
  onCloseMobile,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-muted/30 dark:bg-background text-foreground dark:text-sidebar-foreground">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border dark:border-sidebar-border/70 px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center shrink-0">
            <Image
              src="/vGreens.svg"
              alt="vGreens Lab"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          {(!isCollapsed || mobile) && (
            <span className="font-semibold text-foreground dark:text-sidebar-foreground">
              vGreens Lab
            </span>
          )}
        </div>
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground dark:text-sidebar-foreground hover:bg-accent dark:hover:bg-sidebar-accent"
            onClick={onToggleCollapse}
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        )}
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground dark:text-sidebar-foreground hover:bg-accent dark:hover:bg-sidebar-accent"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && onCloseMobile()}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground dark:bg-sidebar-accent dark:text-sidebar-accent-foreground dark:shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-sidebar-foreground/90 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground',
                isCollapsed && !mobile && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || mobile) && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !isCollapsed && !mobile && (
                <div className="ml-auto h-6 w-1 rounded-full bg-primary-foreground/90 dark:bg-primary shadow-sm" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Other Menu */}
      {(!isCollapsed || mobile) && (
        <>
          <Separator className="bg-border dark:bg-sidebar-border/70" />
          <div className="px-4 py-2">
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-sidebar-foreground/70">
              {t.common.otherMenu}
            </p>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="relative w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-sidebar-foreground/90 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>
                  {theme === 'dark' ? t.common.darkMode : t.common.lightMode}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 dark:text-sidebar-foreground/90 dark:hover:bg-destructive/25 dark:hover:text-sidebar-foreground"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>{t.common.logout}</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* User Profile */}
      <div className="border-t border-border dark:border-sidebar-border/70 p-4">
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed && !mobile && 'justify-center'
          )}
        >
          <Avatar className="h-10 w-10">
            {defaultUser.avatar ? (
              <AvatarImage src={defaultUser.avatar} alt={defaultUser.name} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground dark:bg-sidebar-accent dark:text-sidebar-accent-foreground dark:border dark:border-sidebar-border/70">
                {defaultUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          {(!isCollapsed || mobile) && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground dark:text-sidebar-foreground">
                {defaultUser.name}
              </p>
              <p className="truncate text-xs text-muted-foreground dark:text-sidebar-foreground/70">
                {defaultUser.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
