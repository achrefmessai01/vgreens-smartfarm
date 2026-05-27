'use client';

import { User } from '@/generated/graphql';
import { useI18n } from '@/i18n';
import * as React from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface AppMobileLayoutProps {
  children: React.ReactNode;
  user?: User;
  onLogout?: () => void;
}

/**
 * Mobile-optimized layout that grows dynamically to fit content.
 * Uses min-h-screen instead of h-screen to allow content to expand naturally.
 */
export function AppMobileLayout({
  children,
  user,
  onLogout,
}: AppMobileLayoutProps) {
  const { t } = useI18n();
  const handleLogout = () => {
    onLogout?.();
  };

  const handleSettingsClick = () => {
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sidebar for mobile navigation (Sheet) */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Navbar user={navbarUser} onSettingsClick={handleSettingsClick} />
        <main className="bg-background flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
