'use client';

import { User } from '@/generated/graphql';
import * as React from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User;
  onLogout?: () => void;
}

export function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

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
            : user.email || 'Unknown User',
        avatar: user.imageUrl || undefined,
      }
    : undefined;

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
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
