'use client'

import * as React from 'react'
import { useI18n } from '@/i18n'
import { UserMenu } from './user-menu'

interface NavbarProps {
  user?: {
    name: string
    avatar?: string
  }
  welcomeMessage?: string
  dateInfo?: string
  onSettingsClick?: () => void
}

export function Navbar({ user, welcomeMessage, dateInfo }: NavbarProps) {
  const { t } = useI18n()

  const defaultUser = {
    name: user?.name || 'User',
    avatar: user?.avatar,
  }

  const defaultWelcomeMessage = `${t.common.welcomeBack}, ${defaultUser.name} 👋`
  const defaultDateInfo = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Welcome Section */}
        <div className="hidden md:block">
          <p className="text-sm font-medium text-foreground dark:text-white">
            {welcomeMessage || defaultWelcomeMessage}
          </p>
          <p className="text-xs text-muted-foreground dark:text-white">
            {dateInfo || defaultDateInfo}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </nav>
  )
}
