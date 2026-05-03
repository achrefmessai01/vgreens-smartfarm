'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

interface FlagIconProps {
  locale: Locale;
  className?: string;
}

const flagMap: Record<Locale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  pt: '🇵🇹',
  pl: '🇵🇱',
  ro: '🇷🇴',
  tr: '🇹🇷',
  el: '🇬🇷',
  ar: '🇸🇦',
};

const ariaLabelMap: Record<Locale, string> = {
  en: 'United Kingdom flag',
  de: 'Germany flag',
  fr: 'France flag',
  es: 'Spain flag',
  it: 'Italy flag',
  pt: 'Portugal flag',
  pl: 'Poland flag',
  ro: 'Romania flag',
  tr: 'Türkiye flag',
  el: 'Greece flag',
  ar: 'Saudi Arabia flag',
};

export function FlagIcon({ locale, className }: FlagIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center leading-none',
        className,
      )}
      role="img"
      aria-label={ariaLabelMap[locale]}
    >
      {flagMap[locale]}
    </span>
  );
}
