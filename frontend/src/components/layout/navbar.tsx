'use client';

import { useI18n } from '@/i18n';
import { UserMenu } from './user-menu';

interface NavbarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  welcomeMessage?: string;
  dateInfo?: string;
  onSettingsClick?: () => void;
}

export function Navbar({ user, welcomeMessage, dateInfo }: NavbarProps) {
  const { t } = useI18n();

  const defaultUser = {
    name: user?.name || 'User',
    avatar: user?.avatar,
  };

  const defaultWelcomeMessage = `${t.common.welcomeBack}, ${defaultUser.name} 👋`;
  const defaultDateInfo = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <nav className="bg-background dark:bg-background sticky top-0 z-30 flex h-16 items-center justify-end border-b px-4 lg:justify-between lg:px-6">
      <div className="absolute inset-x-0 flex justify-center px-16 md:px-20 lg:static lg:flex-1 lg:justify-start lg:px-0">
        {/* Welcome Section */}
        <div className="max-w-full min-w-0 text-center lg:text-left">
          <p className="text-foreground truncate text-xs font-medium sm:text-sm dark:text-white">
            {welcomeMessage || defaultWelcomeMessage}
          </p>
          <p className="text-muted-foreground truncate text-[11px] sm:text-xs dark:text-white">
            {dateInfo || defaultDateInfo}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-2 flex items-center gap-2">
        <UserMenu />
      </div>
    </nav>
  );
}
