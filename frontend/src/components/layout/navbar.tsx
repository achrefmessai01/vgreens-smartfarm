'use client'

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
    <nav className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background px-4 dark:bg-background lg:justify-between lg:px-6">
      <div className="absolute inset-x-0 flex justify-center px-16 md:px-20 lg:static lg:flex-1 lg:justify-start lg:px-0">
        {/* Welcome Section */}
        <div className="min-w-0 max-w-full text-center lg:text-left">
          <p className="truncate text-xs font-medium text-foreground dark:text-white sm:text-sm">
            {welcomeMessage || defaultWelcomeMessage}
          </p>
          <p className="truncate text-[11px] text-muted-foreground dark:text-white sm:text-xs">
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
