'use client';

import * as React from 'react';
import { useI18n } from '@/i18n';
import { locales, localeNativeNames } from '@/i18n/config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlagIcon } from '@/components/ui/flag-icon';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="p-2"
          size="sm"
          aria-label={t.common.changeLanguage}
        >
          <FlagIcon locale={locale} className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              'flex items-center gap-2',
              locale === loc && 'bg-accent font-medium',
            )}
            // Render each label in its own natural direction so the Arabic
            // entry mirrors even while the menu itself stays LTR.
            dir={loc === 'ar' ? 'rtl' : 'ltr'}
          >
            <FlagIcon locale={loc} className="h-4 w-4" />
            <span>{localeNativeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
