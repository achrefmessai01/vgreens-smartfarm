'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultLocale, isRtlLocale, locales, type Locale } from './config';
import { getTranslations, type Translations } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  /** True when the active locale renders right-to-left (Arabic, etc.). */
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'locale';

function isValidLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (locales as readonly string[]).includes(value)
  );
}

function getBrowserLocale(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  const candidates =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (isValidLocale(candidate)) return candidate;
    const primary = candidate.split('-')[0]?.toLowerCase();
    if (primary && isValidLocale(primary)) return primary;
  }
  return null;
}

function syncDocumentDirection(locale: Locale) {
  if (typeof document === 'undefined') return;
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function I18nProvider({
  children,
  defaultLocale: providerDefault = defaultLocale,
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Resolution order on client: localStorage → navigator.language → default.
    // The DB-stored user preference layers on top later via I18nUserSync.
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isValidLocale(saved)) return saved;
      const browserLocale = getBrowserLocale();
      if (browserLocale) return browserLocale;
    }
    return providerDefault;
  });

  // Keep <html lang> and <html dir> in sync with the active locale so
  // browser features (spellcheck, RTL layout, copy/paste hints) follow it.
  useEffect(() => {
    syncDocumentDirection(locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
    syncDocumentDirection(newLocale);
  };

  const t = getTranslations(locale);
  const isRtl = isRtlLocale(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
