'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SidebarContent } from './sidebar-content'
import {
  Sprout,
  Clock,
  Menu,
  Users,
  Video,
  AlertTriangle,
  Bell,
  LayoutDashboard,
  Building2,
  Flag,
  Settings,
} from 'lucide-react'
import { User, UserRole } from '@/generated/graphql'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useTenantFeatures } from '@/lib/hooks/use-tenant-features'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  featureKey?: string // Optional feature key to check if item should be shown
}

interface SidebarProps {
  user?: User | null
  onLogout?: () => void
}

export function Sidebar({ user: propUser, onLogout }: SidebarProps) {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  // Always fetch current user to confirm role
  const { user: currentUser, role, loading: userLoading } = useCurrentUser()
  const { hasFeature, loading: featuresLoading } = useTenantFeatures()

  // Handle logout
  const handleLogout = React.useCallback(async () => {
    try {
      await signOut()
      router.push('/login')
      // Call custom onLogout if provided
      if (onLogout) {
        onLogout()
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [signOut, router, onLogout])

  // Use current user if available, otherwise fall back to prop
  const user = currentUser || propUser
  const isVGreensAdmin = role === UserRole.VgreensAdmin

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Tenants',
      href: '/admin/tenants',
      icon: Building2,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Feature Flags',
      href: '/admin/feature-flags',
      icon: Flag,
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ]

  // Tenant navigation items - filtered by enabled features
  const allTenantNavItems: NavItem[] = [
    {
      label: t.navigation.farmOverview,
      href: '/tenant/farm-overview',
      icon: Sprout,
      featureKey: 'farm_overview', // Always show farm overview
    },
    {
      label: t.navigation.users,
      href: '/tenant/users',
      icon: Users,
      featureKey: 'user_management', // Always show user management
    },
    {
      label: t.navigation.warnings,
      href: '/tenant/warnings',
      icon: Bell,
      featureKey: 'sensor_alerts',
    },
    {
      label: t.navigation.alerts,
      href: '/tenant/alerts',
      icon: AlertTriangle,
      featureKey: 'sensor_alerts',
    },
    {
      label: t.navigation.cameraLivestream,
      href: '/tenant/camera-livestream',
      icon: Video,
      featureKey: 'camera_livestream',
    },
    {
      label: t.navigation.history,
      href: '/tenant/history',
      icon: Clock,
      featureKey: 'data_analytics',
    },
  ]

  // Filter navigation items based on enabled features
  const tenantNavItems: NavItem[] = allTenantNavItems.filter((item) => {
    // Always show items without featureKey or if feature is enabled
    if (!item.featureKey) return true
    // For admin users, show all items
    if (isVGreensAdmin) return true
    // For tenant users, check if feature is enabled
    return hasFeature(item.featureKey)
  })

  // Select nav items based on role
  const navItems = isVGreensAdmin ? adminNavItems : tenantNavItems

  const defaultUser = {
    name: user?.firstName
      ? `${user.firstName} ${user.lastName}`
      : 'Unknown User',
    role: user?.role || (isVGreensAdmin ? 'VGREENS_ADMIN' : 'TENANT_USER'),
    avatar: user?.imageUrl || '',
  }

  // Show loading state while fetching user or features
  if (userLoading || (!isVGreensAdmin && featuresLoading)) {
    return (
      <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-40 border-r dark:border-primary-foreground/30 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SidebarContent
            mobile
            isCollapsed={false}
            pathname={pathname}
            navItems={navItems}
            defaultUser={defaultUser}
            t={t}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
            onToggleCollapse={toggleCollapse}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300 border-r dark:border-primary-foreground/30',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          pathname={pathname}
          navItems={navItems}
          defaultUser={defaultUser}
          t={t}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </aside>
    </>
  )
}
