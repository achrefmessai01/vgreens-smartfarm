'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/config'

interface FlagIconProps {
  locale: Locale
  className?: string
}

const flagMap: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
}

const ariaLabelMap: Record<Locale, string> = {
  en: 'United States flag',
  de: 'Germany flag',
}

export function FlagIcon({ locale, className }: FlagIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center leading-none',
        className
      )}
      role="img"
      aria-label={ariaLabelMap[locale]}
    >
      {flagMap[locale]}
    </span>
  )
}
