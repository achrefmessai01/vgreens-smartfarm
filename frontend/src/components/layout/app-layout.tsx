'use client';

import type { UserData } from '@/lib/graphql-compat';
import { useI18n } from '@/i18n';
import { useResponsiveBreakpoint } from '@/lib/hooks/use-responsive-breakpoint';
import { SelectedTenantProvider } from '@/lib/contexts/selected-tenant-context';
import * as React from 'react';
import { AppMobileLayout } from './app-mobile-layout';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { TenantNavbar } from './tenant-navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: UserData;
  onLogout?: () => void;
}

function AppLayoutInner({ children, user, onLogout }: AppLayoutProps) {
  const { t } = useI18n();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isMobile, isInitialized } = useResponsiveBreakpoint('lg');

  React.useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleLogout = () => {
    onLogout?.();
    // Add logout logic here (e.g., clear auth token, redirect to login)
  };

  const handleSettingsClick = () => {
    // Add settings logic here
    console.log('Settings clicked');
  };

  // Transform user for Navbar
  const navbarUser = user
    ? {
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || t.common.unknownUser,
        avatar: user.imageUrl || undefined,
      }
    : undefined;

  // Show loading state or default to desktop layout until initialized
  if (!isInitialized) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          user={user}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
        <div
          className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}
        >
          <Navbar user={navbarUser} onSettingsClick={handleSettingsClick} />
          <TenantNavbar />
          <main className="bg-background min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Use mobile layout for small screens
  if (isMobile) {
    return (
      <AppMobileLayout user={user} onLogout={onLogout}>
        {children}
      </AppMobileLayout>
    );
  }

  // Desktop layout with fixed height and overflow
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}
      >
        <Navbar user={navbarUser} onSettingsClick={handleSettingsClick} />
        <TenantNavbar />
        <main className="bg-background flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Public AppLayout wrapper — installs the SelectedTenantProvider so the
 * global navbar tenant selector + every tenant-scoped data hook beneath it
 * share a single source of truth. We wrap here (rather than higher up) so
 * the provider only mounts inside authenticated app routes; public pages
 * (login, landing) don't touch tenant state at all.
 */
export function AppLayout(props: AppLayoutProps) {
  return (
    <SelectedTenantProvider>
      <AppLayoutInner {...props} />
    </SelectedTenantProvider>
  );
}
